import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBasicPlanDto } from './dto/create-basic-plan.dto';
import { UpdateBasicPlanDto } from './dto/update-basic-plan.dto';
import { PrismaService } from 'src/prisma/prisma.service';

interface PricingResponse {
  basicPackage: {
    basePrice: number;
    perUser: number;
    perWorkspace: number;
    addons: Array<{
      id: string;
      name: string;
      logo: string;
      price: number;
    }>;
  }
}

@Injectable()
export class BasicPlanService {
  constructor(private prisma: PrismaService) { }

  async getBasicPlan(billingPeriod: 'monthly' | 'yearly' = 'monthly') {
    const [plan, modules] = await Promise.all([
      this.prisma.basicPackage.findFirst(),
      this.prisma.modulePrice.findMany()
    ]);

    if (!plan) {
      throw new NotFoundException('No basic plan found');
    }

    const response = {
      basicPackage: {
        basePrice: billingPeriod === 'yearly' ? plan.yearlyBasicPrice : plan.monthlyBasicPrice,
        perUser: billingPeriod === 'yearly' ? plan.yearlyPricePerUser : plan.monthlyPricePerUser,
        perWorkspace: billingPeriod === 'yearly' ? plan.yearlyPricePerWorkspace : plan.monthlyPricePerWorkspace,
        addons: modules.map(module => ({
          id: module.id,
          name: module.name,
          logo: module.logo,
          price: billingPeriod === 'yearly' ? module.priceYear : module.priceMonth
        }))
      }
    };

    return response;
  }

  async getMonthlyPricing() {
    return this.getBasicPlan('monthly');
  }

  async getYearlyPricing() {
    return this.getBasicPlan('yearly');
  }

  async updatePlan(updateBasicPlanDto: UpdateBasicPlanDto) {
    // Get the current plan
    const currentPlan = await this.prisma.basicPackage.findFirst();

    if (!currentPlan) {
      // For creation, we need all fields
      if (!updateBasicPlanDto.monthlyBasicPrice ||
        !updateBasicPlanDto.monthlyPricePerUser ||
        !updateBasicPlanDto.monthlyPricePerWorkspace ||
        !updateBasicPlanDto.yearlyBasicPrice ||
        !updateBasicPlanDto.yearlyPricePerUser ||
        !updateBasicPlanDto.yearlyPricePerWorkspace) {
        throw new Error('All price fields are required when creating a new basic package');
      }

      return this.prisma.basicPackage.create({
        data: {
          monthlyBasicPrice: updateBasicPlanDto.monthlyBasicPrice,
          monthlyPricePerUser: updateBasicPlanDto.monthlyPricePerUser,
          monthlyPricePerWorkspace: updateBasicPlanDto.monthlyPricePerWorkspace,
          yearlyBasicPrice: updateBasicPlanDto.yearlyBasicPrice,
          yearlyPricePerUser: updateBasicPlanDto.yearlyPricePerUser,
          yearlyPricePerWorkspace: updateBasicPlanDto.yearlyPricePerWorkspace
        }
      });
    }

    // For updates, only include provided fields
    const updateData = {};
    if (updateBasicPlanDto.monthlyBasicPrice !== undefined) updateData['monthlyBasicPrice'] = updateBasicPlanDto.monthlyBasicPrice;
    if (updateBasicPlanDto.monthlyPricePerUser !== undefined) updateData['monthlyPricePerUser'] = updateBasicPlanDto.monthlyPricePerUser;
    if (updateBasicPlanDto.monthlyPricePerWorkspace !== undefined) updateData['monthlyPricePerWorkspace'] = updateBasicPlanDto.monthlyPricePerWorkspace;
    if (updateBasicPlanDto.yearlyBasicPrice !== undefined) updateData['yearlyBasicPrice'] = updateBasicPlanDto.yearlyBasicPrice;
    if (updateBasicPlanDto.yearlyPricePerUser !== undefined) updateData['yearlyPricePerUser'] = updateBasicPlanDto.yearlyPricePerUser;
    if (updateBasicPlanDto.yearlyPricePerWorkspace !== undefined) updateData['yearlyPricePerWorkspace'] = updateBasicPlanDto.yearlyPricePerWorkspace;

    // Update the existing plan
    return this.prisma.basicPackage.update({
      where: {
        id: currentPlan.id
      },
      data: updateData
    });
  }

  async calculatePrice(
    users: number,
    workspaces: number,
    billingPeriod: 'monthly' | 'yearly',
    moduleIds: string[],
    couponCode?: string
  ) {
    const [plan, selectedModules, coupon] = await Promise.all([
      this.prisma.basicPackage.findFirst(),
      this.prisma.modulePrice.findMany({
        where: {
          id: {
            in: moduleIds
          }
        }
      }),
      couponCode ? this.prisma.coupon.findUnique({
        where: { code: couponCode }
      }) : null
    ]);

    if (!plan) {
      throw new NotFoundException('No basic plan found');
    }

    const isYearly = billingPeriod === 'yearly';

    // Calculate base prices
    const basePrice = isYearly ? plan.yearlyBasicPrice : plan.monthlyBasicPrice;
    const userPrice = isYearly
      ? plan.yearlyPricePerUser * users
      : plan.monthlyPricePerUser * users;
    const workspacePrice = isYearly
      ? plan.yearlyPricePerWorkspace * workspaces
      : plan.monthlyPricePerWorkspace * workspaces;

    // Calculate module prices
    const moduleDetails = selectedModules.map(module => ({
      id: module.id,
      name: module.name,
      logo: module.logo,
      price: isYearly ? module.priceYear : module.priceMonth
    }));

    const modulePrice = moduleDetails.reduce((sum, module) => sum + module.price, 0);
    const subtotal = basePrice + userPrice + workspacePrice + modulePrice;

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
        base: {
          price: basePrice,
          description: 'Basic Package Price'
        },
        users: {
          count: users,
          pricePerUnit: isYearly ? plan.yearlyPricePerUser : plan.monthlyPricePerUser,
          total: userPrice,
          description: `${users} users`
        },
        workspaces: {
          count: workspaces,
          pricePerUnit: isYearly ? plan.yearlyPricePerWorkspace : plan.monthlyPricePerWorkspace,
          total: workspacePrice,
          description: `${workspaces} workspaces`
        },
        Extensions: {
          items: moduleDetails,
          total: modulePrice,
          description: 'Selected modules'
        },
        coupon: couponCode ? {
          code: couponCode,
          isValid: !couponError,
          error: couponError,
          discount: couponError ? 0 : discount,
          message: couponError ? null : couponMessage
        } : null
      },
      summary: {
        billingPeriod,
        'Basic Package': basePrice,
        'Users': `${userPrice}$ (Per User ${isYearly ? plan.yearlyPricePerUser : plan.monthlyPricePerUser}$)`,
        'Workspace': `${workspacePrice}$ (Per Work ${isYearly ? plan.yearlyPricePerWorkspace : plan.monthlyPricePerWorkspace}$)`,
        'Extensions': modulePrice,
        subtotal,
        'Coupon Status': couponCode ? (couponError || `Applied: ${couponMessage}`) : 'No coupon applied',
        'Coupon Discount': couponError ? 0 : (discount ? `-${discount}$` : 0),
        total: couponError ? subtotal : total,
        currency: 'USD',
        interval: isYearly ? '/year' : '/month'
      }
    };
  }
}
