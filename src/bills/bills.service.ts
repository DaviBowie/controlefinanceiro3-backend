import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Bill, BillType } from './bill.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private readonly repo: Repository<Bill>,
  ) {}

  create(dto: CreateBillDto, userId: number): Promise<Bill> {
    return this.repo.save(this.repo.create({ ...dto, userId }));
  }

  findAll(userId: number, type?: BillType): Promise<Bill[]> {
    const where: FindOptionsWhere<Bill> = { userId };
    if (type) where.type = type;
    return this.repo.find({ where, order: { vencimento: 'ASC', id: 'DESC' } });
  }

  async findOne(id: number, userId: number): Promise<Bill> {
    const bill = await this.repo.findOneBy({ id, userId });
    if (!bill) throw new NotFoundException(`Conta com id ${id} não encontrada.`);
    return bill;
  }

  async update(id: number, dto: UpdateBillDto, userId: number): Promise<Bill> {
    const bill = await this.findOne(id, userId);
    return this.repo.save({ ...bill, ...dto });
  }

  async remove(id: number, userId: number): Promise<{ id: number }> {
    const bill = await this.findOne(id, userId);
    await this.repo.remove(bill);
    return { id };
  }

  async liquidar(id: number, userId: number): Promise<Bill> {
    const bill = await this.findOne(id, userId);
    const today = new Date().toISOString().slice(0, 10);
    return this.repo.save({ ...bill, liquidadoEm: today });
  }
}
