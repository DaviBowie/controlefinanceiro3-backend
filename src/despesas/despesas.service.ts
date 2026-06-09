import { Injectable, NotFoundException } from '@nestjs/common';
import { Despesa } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDespesaDto } from './dto/create-despesa.dto';
import { UpdateDespesaDto } from './dto/update-despesa.dto';

// Forma de resposta da API: igual ao registo do Prisma mas com `valor` como number
// (o Prisma devolve Decimal, que serializa como string em JSON).
export type DespesaResponse = Omit<Despesa, 'valor'> & { valor: number };

@Injectable()
export class DespesasService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(d: Despesa): DespesaResponse {
    return { ...d, valor: Number(d.valor) };
  }

  async create(dto: CreateDespesaDto): Promise<DespesaResponse> {
    const despesa = await this.prisma.despesa.create({ data: dto });
    return this.toResponse(despesa);
  }

  async findAll(): Promise<DespesaResponse[]> {
    const despesas = await this.prisma.despesa.findMany({
      orderBy: [{ data: 'desc' }, { id: 'desc' }],
    });
    return despesas.map((d) => this.toResponse(d));
  }

  async findOne(id: number): Promise<DespesaResponse> {
    const despesa = await this.prisma.despesa.findUnique({ where: { id } });
    if (!despesa) {
      throw new NotFoundException(`Despesa com id ${id} nao encontrada.`);
    }
    return this.toResponse(despesa);
  }

  async update(id: number, dto: UpdateDespesaDto): Promise<DespesaResponse> {
    await this.findOne(id); // garante 404 antes do update
    const despesa = await this.prisma.despesa.update({ where: { id }, data: dto });
    return this.toResponse(despesa);
  }

  async remove(id: number): Promise<{ id: number }> {
    await this.findOne(id);
    await this.prisma.despesa.delete({ where: { id } });
    return { id };
  }
}
