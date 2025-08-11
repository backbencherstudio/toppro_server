import { PaymentTransaction } from '@prisma/client';

export class StripePaymentEntity {
  id: string;
  amount: number;
  paidAmount: number;
  currency: string;
  paidCurrency: string;
  status: string;
  type: string;
  provider: string;
  referenceNumber: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(tx: PaymentTransaction) {
    this.id = tx.id;
    this.amount = tx.amount?.toNumber() ?? 0;
    this.paidAmount = tx.paid_amount?.toNumber() ?? 0;
    this.currency = tx.currency ?? 'usd';
    this.paidCurrency = tx.paid_currency ?? 'usd';
    this.status = tx.status ?? 'pending';
    this.type = tx.type ?? 'transfer';
    this.provider = tx.provider ?? 'stripe';
    this.referenceNumber = tx.reference_number;
    this.senderId = tx.user_id ?? '';
    this.receiverId = tx.receiver_id ?? '';
    this.createdAt = tx.created_at;
    this.updatedAt = tx.updated_at;
  }
}
