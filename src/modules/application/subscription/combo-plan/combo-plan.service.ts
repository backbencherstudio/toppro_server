import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateComboPlanDto } from './dto/create-combo-plan.dto';
import { UpdateComboPlanDto } from './dto/update-combo-plan.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ComboPlanService {
  constructor(private prisma: PrismaService) { }

  async create(createComboPlanDto: CreateComboPlanDto) {
    const { moduleIds, ...planData } = createComboPlanDto;

    // Verify that all moduleIds exist
    const modules = await this.prisma.modulePrice.findMany({
      where: {
        id: {
          in: moduleIds
        }
      }
    });

    if (modules.length !== moduleIds.length) {
      throw new NotFoundException('One or more module IDs are invalid');
    }

    // Create the combo plan with the module connections
    const comboPlan = await this.prisma.comboPlan.create({
      data: {
        ...planData,
        modules: {
          connect: moduleIds.map(id => ({ id }))
        }
      },
      include: {
        modules: true // Include the connected modules in the response
      }
    });

    return comboPlan;
  }

  async findall(billingPeriod?: 'monthly' | 'yearly') {
    const comboPlans = await this.prisma.comboPlan.findMany({
      include: {
        modules: true
      },
      where: {
        isEnabled: true
      }
    });

    const updatedComboPlans = comboPlans.map(plan => {
      const basePrice = billingPeriod === 'yearly' ? plan.pricePerYear : plan.pricePerMonth;

      // Calculate total module prices based on billing period
      const modulePrice = plan.modules.reduce((total, module) => {
        return total + (billingPeriod === 'yearly' ? module.priceYear : module.priceMonth);
      }, 0);

      // Format modules to only show relevant prices
      const formattedModules = plan.modules.map(module => {
        const { priceMonth, priceYear, ...rest } = module;
        return {
          ...rest,
          price: billingPeriod === 'yearly' ? priceYear : priceMonth
        };
      });

      // Remove the irrelevant price field from the plan
      const { pricePerMonth, pricePerYear, ...restPlan } = plan;

      return {
        ...restPlan,
        price: basePrice + modulePrice,
        billingPeriod: billingPeriod || 'monthly',
        modules: formattedModules,
        numberOfUsers: plan.numberOfUsers === -1 ? 'unlimited' : plan.numberOfUsers,
        numberOfWorkspaces: plan.numberOfWorkspaces === -1 ? 'unlimited' : plan.numberOfWorkspaces,
      };
    });

    return updatedComboPlans;
  }

  async findMonthlyPlans() {
    return this.findall('monthly');
  }

  async findYearlyPlans() {
    return this.findall('yearly');
  }

  // Update Combo Plan
  async update(id: string, updateComboPlanDto: UpdateComboPlanDto) {
    const { moduleIds, ...planData } = updateComboPlanDto;

    // Check if the Combo Plan exists
    const existingComboPlan = await this.prisma.comboPlan.findUnique({
      where: { id },
      include: {
        modules: true
      }
    });

    if (!existingComboPlan) {
      throw new NotFoundException('Combo Plan not found');
    }

    // Verify that all moduleIds exist
    if (moduleIds && moduleIds.length > 0) {
      const modules = await this.prisma.modulePrice.findMany({
        where: {
          id: {
            in: moduleIds
          }
        }
      });

      if (modules.length !== moduleIds.length) {
        throw new NotFoundException('One or more module IDs are invalid');
      }

      // Update the modules associated with the Combo Plan
      await this.prisma.comboPlan.update({
        where: { id },
        data: {
          ...planData,
          modules: {
            set: [], // Clear existing module associations before adding new ones
            connect: moduleIds.map(id => ({ id }))
          }
        }
      });
    } else {
      // Update without changing modules
      await this.prisma.comboPlan.update({
        where: { id },
        data: {
          ...planData
        }
      });
    }

    // Fetch and return the updated combo plan
    return this.prisma.comboPlan.findUnique({
      where: { id },
      include: {
        modules: true
      }
    });
  }

  // Delete Combo Plan
  async delete(id: string) {
    // Check if the Combo Plan exists
    const existingComboPlan = await this.prisma.comboPlan.findUnique({
      where: { id }
    });

    if (!existingComboPlan) {
      throw new NotFoundException('Combo Plan not found');
    }

    // Delete the Combo Plan
    await this.prisma.comboPlan.delete({
      where: { id }
    });

    return { message: 'Combo Plan deleted successfully' };
  }

}



