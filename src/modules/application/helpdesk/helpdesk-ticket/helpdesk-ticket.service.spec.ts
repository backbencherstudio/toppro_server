import { Test, TestingModule } from '@nestjs/testing';
import { HelpDeskTicketService } from './helpdesk-ticket.service';

describe('HelpDeskTicketService', () => {
  let service: HelpDeskTicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelpDeskTicketService],
    }).compile();

    service = module.get<HelpDeskTicketService>(HelpDeskTicketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
