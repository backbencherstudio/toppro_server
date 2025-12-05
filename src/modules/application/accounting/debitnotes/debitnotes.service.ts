import { Injectable } from '@nestjs/common';
import { CreateDebitnoteDto } from './dto/create-debitnote.dto';
import { UpdateDebitnoteDto } from './dto/update-debitnote.dto';

@Injectable()
export class DebitnotesService {
  create(createDebitnoteDto: CreateDebitnoteDto) {
    return 'This action adds a new debitnote';
  }

  findAll() {
    return `This action returns all debitnotes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} debitnote`;
  }

  update(id: number, updateDebitnoteDto: UpdateDebitnoteDto) {
    return `This action updates a #${id} debitnote`;
  }

  remove(id: number) {
    return `This action removes a #${id} debitnote`;
  }
}
