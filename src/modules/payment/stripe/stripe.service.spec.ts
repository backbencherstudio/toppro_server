import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('StripeService', () => {
  let service: StripeService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    paymentTransaction: {
      create: jest.fn(),
    },
  };

  const mockStripe = {
    createPaymentIntent: jest.fn().mockResolvedValue({
      id: 'pi_123',
      amount: 1000,
      currency: 'usd',
      status: 'succeeded',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    (service as any).stripe = mockStripe;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process user-to-user payment', async () => {
    mockPrisma.user.findUnique
      .mockResolvedValueOnce({ id: 'sender-id' })   // sender
      .mockResolvedValueOnce({ id: 'receiver-id' }); // receiver

    const dto = {
      senderEmail: 'a@test.com',
      receiverEmail: 'b@test.com',
      amount: 1000,
      paymentMethodId: 'pm_123',
    };

    const result = await service.processUserToUserPayment(dto);

    expect(mockPrisma.paymentTransaction.create).toHaveBeenCalled();
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ success: true, message: 'Payment successful' });
  });
});
