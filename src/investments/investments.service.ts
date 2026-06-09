import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from './investment.entity';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(Investment)
    private readonly repo: Repository<Investment>,
  ) {}

  create(dto: CreateInvestmentDto, userId: number): Promise<Investment> {
    return this.repo.save(this.repo.create({ ...dto, userId }));
  }

  findAll(userId: number): Promise<Investment[]> {
    return this.repo.find({ where: { userId }, order: { dataCompra: 'DESC' } });
  }

  async findOne(id: number, userId: number): Promise<Investment> {
    const inv = await this.repo.findOneBy({ id, userId });
    if (!inv) throw new NotFoundException(`Investimento com id ${id} não encontrado.`);
    return inv;
  }

  async update(id: number, dto: UpdateInvestmentDto, userId: number): Promise<Investment> {
    const inv = await this.findOne(id, userId);
    return this.repo.save({ ...inv, ...dto });
  }

  async remove(id: number, userId: number): Promise<{ id: number }> {
    const inv = await this.findOne(id, userId);
    await this.repo.remove(inv);
    return { id };
  }
}
