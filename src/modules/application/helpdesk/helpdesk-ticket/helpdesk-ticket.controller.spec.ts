import { Test, TestingModule } from '@nestjs/testing';
import { HelpdeskTicketController } from './helpdesk-ticket.controller';
import { HelpdeskTicketService } from './helpdesk-ticket.service';

describe('HelpdeskTicketController', () => {
  let controller: HelpdeskTicketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelpdeskTicketController],
      providers: [HelpdeskTicketService],
    }).compile();

    controller = module.get<HelpdeskTicketController>(HelpdeskTicketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
