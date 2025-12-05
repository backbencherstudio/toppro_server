import { Injectable } from '@nestjs/common';
import { CreateExpensepaymentDto } from './dto/create-expensepayment.dto';
import { UpdateExpensepaymentDto } from './dto/update-expensepayment.dto';

@Injectable()
export class ExpensepaymentService {
  create(createExpensepaymentDto: CreateExpensepaymentDto) {
    return 'This action adds a new expensepayment';
  }

  findAll() {
    return `This action returns all expensepayment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} expensepayment`;
  }

  update(id: number, updateExpensepaymentDto: UpdateExpensepaymentDto) {
    return `This action updates a #${id} expensepayment`;
  }

  remove(id: number) {
    return `This action removes a #${id} expensepayment`;
  }
}
