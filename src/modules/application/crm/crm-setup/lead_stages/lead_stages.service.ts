import { Injectable } from '@nestjs/common';
import { CreateLeadStageDto } from './dto/create-lead_stage.dto';
import { UpdateLeadStageDto } from './dto/update-lead_stage.dto';

@Injectable()
export class LeadStagesService {
  create(createLeadStageDto: CreateLeadStageDto) {
    return 'This action adds a new leadStage';
  }

  findAll() {
    return `This action returns all leadStages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} leadStage`;
  }

  update(id: number, updateLeadStageDto: UpdateLeadStageDto) {
    return `This action updates a #${id} leadStage`;
  }

  remove(id: number) {
    return `This action removes a #${id} leadStage`;
  }
}
