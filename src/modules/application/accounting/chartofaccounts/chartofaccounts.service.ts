import { Injectable } from '@nestjs/common';
import { CreateChartofaccountDto } from './dto/create-chartofaccount.dto';
import { UpdateChartofaccountDto } from './dto/update-chartofaccount.dto';

@Injectable()
export class ChartofaccountsService {
  create(createChartofaccountDto: CreateChartofaccountDto) {
    return 'This action adds a new chartofaccount';
  }

  findAll() {
    return `This action returns all chartofaccounts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chartofaccount`;
  }

  update(id: number, updateChartofaccountDto: UpdateChartofaccountDto) {
    return `This action updates a #${id} chartofaccount`;
  }

  remove(id: number) {
    return `This action removes a #${id} chartofaccount`;
  }
}
