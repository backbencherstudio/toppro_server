import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateNotesDto } from './dto/update-notes.dto';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import { ActivityService } from '../activity/activity.service';
import appConfig from 'src/config/app.config';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService, private activityService: ActivityService) { }


  // async createLead(dto: CreateLeadDto, ownerId: string, workspaceId: string,) {
  //   // Ensure the users field is always an array, even if it's missing or empty
  //   const userIds = Array.from(new Set([ownerId, ...(dto.users || [])]));
  //   if (userIds.length === 0) {
  //     throw new BadRequestException('At least one user must be assigned to the lead');
  //   }

  //   return this.prisma.lead.create({
  //     data: {
  //       subject: dto.subject,
  //       name: dto.name,
  //       email: dto.email,
  //       phone: dto.phone,
  //       followup_at: new Date(dto.followup_at),

  //       owner_id: ownerId,
  //       workspace_id: workspaceId,

  //       user_id: ownerId,

  //       users: {
  //         connect: userIds.map((id) => ({ id })),
  //       },
  //     },
  //     include: {
  //       users: true,
  //     },
  //   });
  // }



  // ✅ Get all leads for a workspace

  async createLead(
    dto: CreateLeadDto,
    ownerId: string,
    workspaceId: string,
  ) {
    try {
      // Ensure the users field is always an array, even if it's missing or empty
      const userIds = Array.from(new Set([ownerId, ...(dto.users || [])]));

      if (userIds.length === 0) {
        throw new BadRequestException(
          'At least one user must be assigned to the lead',
        );
      }

      const lead = await this.prisma.lead.create({
        data: {
          subject: dto.subject,
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          followup_at: new Date(dto.followup_at),

          owner_id: ownerId,
          workspace_id: workspaceId,
          user_id: ownerId,

          users: {
            connect: userIds.map((id) => ({ id })),
          },
        },
        include: {
          users: true,
        },
      });

      return {
        success: true,
        message: 'Lead created successfully',
        data: lead,
      };
    } catch (error) {
      console.error('Error creating lead:', error);

      if (error.code === 'P2002') {
        // Prisma unique constraint error
        throw new BadRequestException('Lead with this email already exists');
      }

      if (error instanceof BadRequestException) {
        throw error; // rethrow known exceptions
      }

      throw new Error(`Failed to create lead: ${error.message}`);
    }
  }

  async getAllLeads(ownerId: string, workspaceId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [leads, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where: {
          workspace_id: workspaceId,
          owner_id: ownerId,
          deleted_at: null,
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          stage: true,
          followup_at: true,
          notes: true,
          calls: true,
          owner_id: true,
          owner: {
            select: { id: true, name: true },
          },
          workspace_id: true,
          workspace: {
            select: { id: true, name: true },
          },
          users: {
            select: { id: true, name: true, email: true },
          },
          _count: { select: { tasks: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.lead.count({
        where: {
          workspace_id: workspaceId,
          owner_id: ownerId,
          deleted_at: null,
        },
      }),
    ]);

    return {
      data: leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        notes: lead.notes,
        calls: lead.calls,
        subject: lead.subject,
        stage: lead.stage,
        followup_at: lead.followup_at,
        owner_id: lead.owner_id ?? null,
        owner_name: lead.owner?.name ?? null,
        workspace_id: lead.workspace_id ?? null,
        workspace_name: lead.workspace?.name ?? null,
        users: lead.users,
        tasks: lead._count.tasks,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }





  // ✅ Get specific lead by ID
  async getLeadById(id: string, ownerId: string, workspaceId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
      select: {
        id: true,
        owner_id: true,
        owner: {
          select: { id: true, name: true },
        },
        workspace_id: true,
        workspace: {
          select: { id: true, name: true },
        },
        email: true,
        phone: true,
        pipeline: {
          select: { id: true, name: true },
        },
        stage: true,
        created_at: true,
        followup_at: true,
        _count: {
          select: {
            tasks: true,
            products: true,
            sources: true,
            files: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${id} not found for this owner/workspace`,
      );
    }

    return {
      id: lead.id,
      owner_id: lead.owner_id,
      owner_name: lead.owner?.name ?? null,
      workspace_id: lead.workspace_id,
      workspace_name: lead.workspace?.name ?? null,
      email: lead.email,
      phone: lead.phone,
      pipeline: lead.pipeline ? lead.pipeline.name : null,
      pipeline_id: lead.pipeline ? lead.pipeline.id : null,
      stage: lead.stage,
      created_at: lead.created_at,
      followup_at: lead.followup_at,
      total_tasks: lead._count.tasks,
      total_products: lead._count.products,
      total_sources: lead._count.sources,
      total_files: lead._count.files,
    };
  }

  async updateLead(id: string, ownerId: string, workspaceId: string, dto: UpdateLeadDto) {
    const sourceConnect = dto.sources
      ? { set: dto.sources.map((id) => ({ id })) }
      : undefined;

    const productConnect = dto.products
      ? { set: dto.products.map((id) => ({ id })) }
      : undefined;

    return this.prisma.lead.update({
      where: {
        id,
        workspace_id: workspaceId,
        owner_id: ownerId,
      },
      data: {
        subject: dto.subject,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        followup_at: dto.followup_at ? new Date(dto.followup_at) : undefined,
        pipeline_id: dto.pipeline_id,
        stage: dto.stage as any, // cast if enum
        notes: dto.notes,
        ...(sourceConnect && { sources: sourceConnect }),
        ...(productConnect && { products: productConnect }),
      },
      include: {
        sources: true,
        products: true,
      },
    });
  }

  // async updateLead(
  //   id: string,
  //   ownerId: string,
  //   workspaceId: string,
  //   dto: UpdateLeadDto,
  // ) {
  //   try {
  //     const sourceConnect = dto.sources
  //       ? { set: dto.sources.map((id) => ({ id })) }
  //       : undefined;

  //     const productConnect = dto.products
  //       ? { set: dto.products.map((id) => ({ id })) }
  //       : undefined;

  //     return await this.prisma.lead.update({
  //       where: { id, workspace_id: workspaceId, owner_id: ownerId },
  //       data: {
  //         subject: dto.subject,
  //         name: dto.name,
  //         email: dto.email,
  //         phone: dto.phone,
  //         followup_at: dto.followup_at ? new Date(dto.followup_at) : undefined,
  //         pipeline_id: dto.pipeline_id,
  //         stage: dto.stage as any, // ✅ updated field
  //         notes: dto.notes,
  //         ...(sourceConnect && { sources: sourceConnect }),
  //         ...(productConnect && { products: productConnect }),
  //       },
  //       include: {
  //         sources: true,
  //         products: true,
  //         lead_stage: { select: { id: true, name: true } }, // include stage
  //         pipeline: { select: { id: true, name: true } },
  //       },
  //     });
  //   } catch (error) {
  //     throw new BadRequestException(error.message || 'Failed to update lead');
  //   }
  // }


  async deleteLead(id: string, ownerId: string, workspaceId: string) {
    // ✅ Validate lead existence
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${id} not found in this workspace for this owner`,
      );
    }

    // ✅ Soft delete
    await this.prisma.lead.update({
      where: { id: lead.id },
      data: { deleted_at: new Date() },
    });

    return {
      success: true,
      message: 'Lead deleted successfully',
      leadId: id,
    };
  }

  //Leads Notes fields update endpoint....
  async updateNotes(leadId: string, workspaceId: string, ownerId: string, dto: UpdateNotesDto) {
    // 1️⃣ Verify lead exists for current owner/workspace
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
      select: { id: true },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with id ${leadId} not found`);
    }

    // 2️⃣ Update only the notes field
    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        notes: dto.notes,
      },
    });

    return {
      success: true,
      message: 'Notes updated successfully',
      lead_id: leadId,
      updated_notes: dto.notes,
    };
  }

  //Leads notes fields showing endpoint...
  async getNotes(leadId: string, workspaceId: string, ownerId: string) {
    // 1️⃣ Verify lead exists for current owner/workspace
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
      select: {
        id: true,
        notes: true, // Only select the notes field
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with id ${leadId} not found`);
    }

    // 2️⃣ Return the notes field
    return {
      success: true,
      lead_id: lead.id,
      notes: lead.notes,
    };
  }


  //Lead files upload....

  // async uploadFile(leadId: string, ownerId: string, workspaceId: string, userId: string, file: Express.Multer.File) {
  //   // Check if the lead exists
  //   const lead = await this.prisma.lead.findUnique({
  //     where: { id: leadId },
  //   });

  //   if (!lead) {
  //     throw new NotFoundException('Lead not found');
  //   }

  //   // Generate a file name (this example uses a random string + timestamp to avoid collisions)
  //   const fileName = `${userId}-${Date.now()}-${file.originalname}`;


  //   // Upload the file using your storage service
  //   await SojebStorage.put(`leads/${fileName}`, file.buffer);

  //   const fileUrl = appConfig().storageUrl.leads+ '/' +`fileName`;


  //   // Create an attachment record in the database
  //   const attachment = await this.prisma.attachment.create({
  //     data: {
  //       lead_id: leadId,
  //       file_name: fileName,
  //       file_url: fileUrl,  // Assuming you serve files under this path
  //       // C:\Users\barsh\Desktop\toppro_server\public\storage\leads\cmgkajbb60001vswgg45h3kpg-1763027446894-654b8e16333d0d5c3130b3e8-lige-mens-watches-waterproof-stainless.jpg
  //       file_size: file.size,
  //     },
  //   });

  //   const owner = await this.prisma.user.findUnique({
  //     where: { id: ownerId },
  //     select: { name: true },
  //   });


  //   // 3️⃣ Create activity via ActivityService
  //   await this.activityService.createActivity(
  //     workspaceId,
  //     ownerId,
  //     leadId,
  //     'File upload',
  //     `${owner?.name || 'Someone'} uploaded new file ${file.originalname}`,
  //   );

  //   return {
  //     success: true,
  //     message: 'File uploaded successfully',
  //     data: attachment,  // Return the attachment info, including file name and URL
  //   };
  // }

  async uploadFile(leadId: string, ownerId: string, workspaceId: string, userId: string, file: Express.Multer.File) {
    // Check if the lead exists
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Generate a file name (this example uses a random string + timestamp to avoid collisions)
    const fileName = `${userId}-${Date.now()}-${file.originalname}`;

    // Upload the file using your storage service
    await SojebStorage.put(`leads/${fileName}`, file.buffer);

    // Corrected file URL construction
    const fileUrl = `${appConfig().storageUrl.rootUrlPublic}/leads/${fileName}`;

    // Create an attachment record in the database
    const attachment = await this.prisma.attachment.create({
      data: {
        lead_id: leadId,
        file_name: fileName,
        file_url: fileUrl,  // Corrected file URL
        file_size: file.size,
      },
    });

    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { name: true },
    });

    // 3️⃣ Create activity via ActivityService
    await this.activityService.createActivity(
      workspaceId,
      ownerId,
      leadId,
      'File upload',
      `${owner?.name || 'Someone'} uploaded new file ${file.originalname}`,
    );

    return {
      success: true,
      message: 'File uploaded successfully',
      data: attachment,  // Return the attachment info, including file name and URL
    };
  }


  // Inside LeadsService
  async getFilesForLead(leadId: string) {
    const files = await this.prisma.attachment.findMany({
      where: {
        lead_id: leadId,
      },
      select: {
        id: true,
        file_name: true,
        file_url: true,
        file_size: true,
      },
    });

    if (!files || files.length === 0) {
      throw new NotFoundException(`No files found for lead with ID ${leadId}`);
    }

    return {
      success: true,
      message: 'Files retrieved successfully',
      files,
    };
  }

  // Inside LeadsService
  async removeFileFromLead(leadId: string, fileId: string) {
    // Find the file by ID and leadId
    const file = await this.prisma.attachment.findFirst({
      where: {
        id: fileId,
        lead_id: leadId,
      },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found for lead ${leadId}`);
    }

    // Remove the file from storage (e.g., delete from your cloud storage or local storage)
    await SojebStorage.delete(file.file_url);  // Assuming you're using SojebStorage to manage file storage.

    // Remove the file from the database
    await this.prisma.attachment.delete({
      where: {
        id: fileId,
      },
    });

    return {
      success: true,
      message: `File with ID ${fileId} deleted successfully`,
    };
  }

  // Get lead counts per user for reporting
  async getUserLeadCounts(ownerId: string, workspaceId: string) {
    // Get all users in the workspace
    const users = await this.prisma.user.findMany({
      where: {
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Get lead counts for each user
    const userLeadCounts = await Promise.all(
      users.map(async (user) => {
        const leadCount = await this.prisma.lead.count({
          where: {
            workspace_id: workspaceId,
            owner_id: ownerId,
            deleted_at: null,
            users: {
              some: {
                id: user.id,
              },
            },
          },
        });

        return {
          user_name: user.name || 'Unknown',
          user_id: user.id,
          user_email: user.email || 'Unknown',
          lead_count: leadCount,
        };
      })
    );

    // Sort by lead count descending
    userLeadCounts.sort((a, b) => b.lead_count - a.lead_count);

    return userLeadCounts;
  }

  // Get lead counts per pipeline for reporting
  async getPipelineLeadCounts(ownerId: string, workspaceId: string) {
    // Get all pipelines in the workspace
    const pipelines = await this.prisma.pipeline.findMany({
      where: {
        workspace_id: workspaceId,
        owner_id: ownerId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Get lead counts for each pipeline
    const pipelineLeadCounts = await Promise.all(
      pipelines.map(async (pipeline) => {
        const leadCount = await this.prisma.lead.count({
          where: {
            workspace_id: workspaceId,
            owner_id: ownerId,
            deleted_at: null,
            pipeline_id: pipeline.id,
          },
        });

        return {
          pipeline_id: pipeline.id,
          pipeline_name: pipeline.name,
          lead_count: leadCount,
        };
      })
    );

    // Sort by lead count descending
    pipelineLeadCounts.sort((a, b) => b.lead_count - a.lead_count);

    return pipelineLeadCounts;
  }

  // Get lead counts by month for the latest year
  async getMonthlyLeadCounts(ownerId: string, workspaceId: string, month?: string) {
    // Get current year
    const currentYear = new Date().getFullYear();

    // If specific month is requested, filter by that month
    if (month) {
      const monthNumber = this.getMonthNumber(month);
      if (monthNumber === -1) {
        throw new BadRequestException('Invalid month name. Use full month names like "January", "February", etc.');
      }

      const startDate = new Date(currentYear, monthNumber, 1);
      const endDate = new Date(currentYear, monthNumber + 1, 0, 23, 59, 59, 999);

      const leadCount = await this.prisma.lead.count({
        where: {
          workspace_id: workspaceId,
          owner_id: ownerId,
          deleted_at: null,
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      return {
        month: month,
        year: currentYear,
        lead_count: leadCount,
      };
    }

    // Get all months of the current year
    const monthlyCounts = [];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (let i = 0; i < 12; i++) {
      const startDate = new Date(currentYear, i, 1);
      const endDate = new Date(currentYear, i + 1, 0, 23, 59, 59, 999);

      const leadCount = await this.prisma.lead.count({
        where: {
          workspace_id: workspaceId,
          owner_id: ownerId,
          deleted_at: null,
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      monthlyCounts.push({
        month: monthNames[i],
        year: currentYear,
        lead_count: leadCount,
      });
    }

    return monthlyCounts;
  }

  // Helper method to convert month name to number
  private getMonthNumber(monthName: string): number {
    const months = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3,
      'may': 4, 'june': 5, 'july': 6, 'august': 7,
      'september': 8, 'october': 9, 'november': 10, 'december': 11
    };

    return months[monthName.toLowerCase()] ?? -1;
  }

  // Get lead counts per source for reporting
  async getSourceLeadCounts(ownerId: string, workspaceId: string) {
    // Get all sources in the workspace
    const sources = await this.prisma.source.findMany({
      where: {
        workspace_id: workspaceId,
        owner_id: ownerId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Get lead counts for each source
    const sourceLeadCounts = await Promise.all(
      sources.map(async (source) => {
        const leadCount = await this.prisma.lead.count({
          where: {
            workspace_id: workspaceId,
            owner_id: ownerId,
            deleted_at: null,
            sources: {
              some: {
                id: source.id,
              },
            },
          },
        });

        return {
          source_name: source.name,
          source_id: source.id,
          lead_count: leadCount,
        };
      })
    );

    // Sort by lead count descending
    sourceLeadCounts.sort((a, b) => b.lead_count - a.lead_count);

    return sourceLeadCounts;
  }

  // Get lead counts per day for the latest week
  async getDailyLeadCounts(ownerId: string, workspaceId: string) {
    // Get the start and end of the current week (Monday to Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Sunday being 0

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get all days of the week
    const dailyCounts = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);

      const startOfDay = new Date(currentDay);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(currentDay);
      endOfDay.setHours(23, 59, 59, 999);

      const leadCount = await this.prisma.lead.count({
        where: {
          workspace_id: workspaceId,
          owner_id: ownerId,
          deleted_at: null,
          created_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      dailyCounts.push({
        day: dayNames[i],
        // date: currentDay.toISOString().split('T')[0], // YYYY-MM-DD format
        lead_count: leadCount,
      });
    }

    // Calculate total count for the week
    const totalCount = dailyCounts.reduce((sum, day) => sum + day.lead_count, 0);

    // Add percentage for each day
    const dailyCountsWithPercentage = dailyCounts.map(day => ({
      ...day,
      //need to add a percentage icon here...
      percentage: totalCount > 0 ? Math.round((day.lead_count / totalCount) * 100 * 100) / 100 : 0
    }));

    return {
      daily_counts: dailyCountsWithPercentage,
      Weekly_total_count: totalCount,
      // week_start: startOfWeek.toISOString().split('T')[0],
      // week_end: endOfWeek.toISOString().split('T')[0],
    };
  }



}
