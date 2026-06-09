import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Transaction, TransactionType } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,
  ) {}

  create(dto: CreateTransactionDto, userId: number): Promise<Transaction> {
    return this.repo.save(this.repo.create({ ...dto, userId }));
  }

  findAll(userId: number, type?: TransactionType): Promise<Transaction[]> {
    const where: FindOptionsWhere<Transaction> = { userId };
    if (type) where.type = type;
    return this.repo.find({ where, order: { data: 'DESC', id: 'DESC' } });
  }

  async findOne(id: number, userId: number): Promise<Transaction> {
    const t = await this.repo.findOneBy({ id, userId });
    if (!t) throw new NotFoundException(`Transação com id ${id} não encontrada.`);
    return t;
  }

  async update(id: number, dto: UpdateTransactionDto, userId: number): Promise<Transaction> {
    const t = await this.findOne(id, userId);
    return this.repo.save({ ...t, ...dto });
  }

  async remove(id: number, userId: number): Promise<{ id: number }> {
    const t = await this.findOne(id, userId);
    await this.repo.remove(t);
    return { id };
  }
}
