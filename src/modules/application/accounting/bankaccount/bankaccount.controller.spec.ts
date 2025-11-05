import { Test, TestingModule } from '@nestjs/testing';
import { BankAccountController } from 'src/modules/application/accounting/bankaccount/bankaccount.controller';
import { BankAccountService } from 'src/modules/application/accounting/bankaccount/bankaccount.service';

describe('BankaccountController', () => {
  let controller: BankAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankAccountController],
      providers: [BankAccountService],
    }).compile();

    controller = module.get<BankAccountController>(BankAccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
