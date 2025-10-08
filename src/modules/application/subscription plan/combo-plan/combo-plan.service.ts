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
      // Format modules to only show name and logo
      const formattedModules = plan.modules.map(module => ({
        name: module.name,
        logo: module.logo
      }));

      // Remove the modules array from the plan to avoid repeating it
      const { pricePerMonth, pricePerYear, modules, ...restPlan } = plan;

      // If billingPeriod is specified, return only that price
      if (billingPeriod) {
        return {
          ...restPlan,
          price: billingPeriod === 'yearly' ? pricePerYear : pricePerMonth,
          billingPeriod,
          modules: formattedModules,
          numberOfUsers: plan.numberOfUsers === -1 ? 'unlimited' : plan.numberOfUsers,
          numberOfWorkspaces: plan.numberOfWorkspaces === -1 ? 'unlimited' : plan.numberOfWorkspaces,
        };
      }

      // If no billingPeriod specified, return both prices
      return {
        ...restPlan,
        pricing: {
          monthly: {
            price: pricePerMonth,
            interval: '/month'
          },
          yearly: {
            price: pricePerYear,
            interval: '/year',
            savings: Math.round((pricePerMonth * 12 - pricePerYear) / (pricePerMonth * 12) * 100)
          }
        },
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

  async calculatePrice(
    planId: string,
    billingPeriod: 'monthly' | 'yearly',
    couponCode?: string
  ) {
    // Fetch combo plan with its modules
    const [plan, coupon] = await Promise.all([
      this.prisma.comboPlan.findUnique({
        where: { id: planId },
        include: { modules: true }
      }),
      couponCode ? this.prisma.coupon.findUnique({
        where: { code: couponCode }
      }) : null
    ]);

    if (!plan) {
      throw new NotFoundException('Combo plan not found');
    }

    const isYearly = billingPeriod === 'yearly';

    // Get the fixed combo plan price
    const subtotal = isYearly ? plan.pricePerYear : plan.pricePerMonth;

    // Calculate coupon discount if applicable
    let discount = 0;
    let couponMessage = null;
    let couponError = null;

    if (couponCode) {
      if (!coupon) {
        couponError = 'Invalid coupon code';
      } else {
        // Validate coupon
        if (!coupon.isActive) {
          couponError = 'This coupon is inactive';
        } else if (coupon.expiryDate && new Date() > coupon.expiryDate) {
          couponError = 'This coupon has expired';
        } else if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          couponError = 'This coupon has reached its usage limit';
        } else if (coupon.minimumSpend && subtotal < coupon.minimumSpend) {
          couponError = `Minimum spend requirement not met. Minimum spend: $${coupon.minimumSpend}`;
        } else {
          // Calculate discount
          if (coupon.type === 'Percentage') {
            discount = (subtotal * coupon.discount) / 100;
            couponMessage = `${coupon.discount}% off`;
          } else {
            discount = coupon.discount;
            couponMessage = `$${coupon.discount} off`;
          }

          // Check maximum spend if set
          if (coupon.maximumSpend && discount > coupon.maximumSpend) {
            discount = coupon.maximumSpend;
            couponMessage += ` (max discount $${coupon.maximumSpend} applied)`;
          }
        }
      }
    }

    const total = subtotal - discount;

    return {
      calculation: {
        plan: {
          id: plan.id,
          name: plan.name,
          type: plan.planType,
          numberOfUsers: plan.numberOfUsers === -1 ? 'unlimited' : plan.numberOfUsers,
          numberOfWorkspaces: plan.numberOfWorkspaces === -1 ? 'unlimited' : plan.numberOfWorkspaces,
          price: subtotal,
          description: 'Combo Plan Price'
        },
        modules: plan.modules.map(m => ({
          name: m.name,
          logo: m.logo
        })),
        coupon: couponCode ? {
          code: couponCode,
          isValid: !couponError,
          discount: couponError ? 0 : discount,
          message: couponError ? null : couponMessage
        } : null
      },
      summary: {
        billingPeriod,
        'Plan Price': subtotal,
        'Coupon Discount': couponError ? 0 : (discount ? `-${discount}$` : 0),
        total: couponError ? subtotal : total,
        currency: 'USD',
        interval: isYearly ? '/year' : '/month'
      }
    };
  }
}



