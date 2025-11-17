import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { PackageStatus } from '@prisma/client';

@Injectable()
export class SubscriptionExpiryCron {
    private readonly logger = new Logger(SubscriptionExpiryCron.name);

    constructor(private prisma: PrismaService) { }

    //@Cron('0 0,6,12,18 * * *')
    //@Cron('0 */4 * * *')
    @Cron(CronExpression.EVERY_HOUR)
    //   @Cron(CronExpression.EVERY_MINUTE)
    async handleExpiredSubscriptions() {

        const now = new Date(new Date().toISOString());
        this.logger.log(`Checking expired subscriptions at: ${now.toISOString()}`);

        const expiredUsers = await this.prisma.user.findMany({
            where: {
                current_period_end: {
                    lte: now,
                },
                package_status: {
                    not: PackageStatus.FREE,
                },
            },
            select: {
                id: true,
                current_period_end: true,
                package_status: true,
            },
        });

        if (!expiredUsers.length) {
            this.logger.log('✔ No expired subscriptions found.');
            return;
        }

        this.logger.log(` Found ${expiredUsers.length} expired users`);

        for (const user of expiredUsers) {
            this.logger.log(
                `🔄 Expiring user: ${user.id}, expired at: ${user.current_period_end}`
            );

            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    package_status: PackageStatus.FREE,
                    subscription_status: 'inactive',
                    current_period_start: null,
                    current_period_end: null,
                },
            });

            this.logger.log(`✔ User ${user.id} → package_status set to FREE`);
        }

        this.logger.log('🎉 Finished processing expired subscriptions.');
    }
}
