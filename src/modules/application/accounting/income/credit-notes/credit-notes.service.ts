import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { UpdateCreditNoteDto } from './dto/update-credit-note.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CreditNotesService {
  constructor(private prisma: PrismaService) { }

  // Create a credit note. If linked to an invoice, ensure amount does not increase invoice due (i.e. credit <= invoice.due)
  async create(dto: CreateCreditNoteDto, ownerId: string, workspaceId: string, userId: string) {
    const { invoice_id, amount, date, description } = dto;

    // If invoice_id provided, validate invoice exists and amount constraint
    if (invoice_id) {
      const invoice = await this.prisma.invoice.findUnique({ where: { id: invoice_id } });
      if (!invoice) throw new NotFoundException('Invoice not found');

      const invoiceDue = invoice.due || 0;
      if (amount > invoiceDue) {
        throw new BadRequestException('Credit note amount exceeds invoice due amount');
      }

      // Ensure no other credit note is linked to this invoice (invoice_id is unique in schema)
      const existingLinked = await (this.prisma as any).creditNote.findUnique({ where: { invoice_id } });
      if (existingLinked) {
        throw new BadRequestException('A credit note is already linked to this invoice');
      }
    }

    const created = await (this.prisma as any).creditNote.create({
      data: {
        invoice_id: invoice_id || null,
        amount,
        date: date ? new Date(date) : new Date(),
        description,
        status: dto.status || 'PENDING',
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
        user_id: userId,
      },
    });

    // If linked to invoice, we do NOT automatically modify invoice.due here; business may apply credit later.
    return created;
  }

  async findAll(ownerId: string, workspaceId: string, userId: string) {
    const where: any = {
      workspace_id: workspaceId,
      owner_id: ownerId || userId,
      // deleted_at: null, // if soft delete is used adjust accordingly
    };

    return (this.prisma as any).creditNote.findMany({ where, orderBy: { created_at: 'desc' } });
  }

  async findOne(id: string, ownerId: string, workspaceId: string, userId: string) {
    const note = await (this.prisma as any).creditNote.findFirst({
      where: {
        id,
        workspace_id: workspaceId,
        owner_id: ownerId || userId,
      },
      include: { invoice: true },
    });

    if (!note) throw new NotFoundException('Credit note not found');
    return note;
  }

  async update(id: string, dto: UpdateCreditNoteDto, ownerId: string, workspaceId: string, userId: string) {
    const existing = await (this.prisma as any).creditNote.findFirst({ where: { id, workspace_id: workspaceId, owner_id: ownerId || userId } });
    if (!existing) throw new NotFoundException('Credit note not found');

    // If invoice_id or amount is changing, validate
    const newInvoiceId = dto.invoice_id !== undefined ? dto.invoice_id : existing.invoice_id;
    const newAmount = dto.amount !== undefined ? dto.amount : existing.amount;

    if (newInvoiceId) {
      const invoice = await this.prisma.invoice.findUnique({ where: { id: newInvoiceId } });
      if (!invoice) throw new NotFoundException('Invoice not found');

      const invoiceDue = invoice.due || 0;
      if ((newAmount || 0) > invoiceDue) {
        throw new BadRequestException('Credit note amount exceeds invoice due amount');
      }
    }

    const updated = await (this.prisma as any).creditNote.update({
      where: { id },
      data: {
        ...(dto.invoice_id !== undefined && { invoice_id: dto.invoice_id }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        updated_at: new Date(),
      },
    });

    return updated;
  }

  async remove(id: string, ownerId: string, workspaceId: string, userId: string) {
    const existing = await (this.prisma as any).creditNote.findFirst({ where: { id, workspace_id: workspaceId, owner_id: ownerId || userId } });
    if (!existing) throw new NotFoundException('Credit note not found');

    await (this.prisma as any).creditNote.delete({ where: { id } });
    return { success: true };
  }
}
