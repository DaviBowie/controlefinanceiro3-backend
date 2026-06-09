import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from '../transactions/transaction.entity';
import { Bill, BillType } from '../bills/bill.entity';
import { Investment } from '../investments/investment.entity';

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

@Injectable()
export class IaContextService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
    @InjectRepository(Bill)
    private readonly bills: Repository<Bill>,
    @InjectRepository(Investment)
    private readonly investments: Repository<Investment>,
  ) {}

  async build(userId: number): Promise<string> {
    const [receitas, despesas, receber, pagar, investimentos] = await Promise.all([
      this.transactions.findBy({ type: TransactionType.RECEITA, userId }),
      this.transactions.findBy({ type: TransactionType.DESPESA, userId }),
      this.bills.findBy({ type: BillType.RECEBER, userId }),
      this.bills.findBy({ type: BillType.PAGAR, userId }),
      this.investments.findBy({ userId }),
    ]);

    const totalRec = receitas.reduce((s, r) => s + r.valor, 0);
    const totalDesp = despesas.reduce((s, d) => s + d.valor, 0);
    const totalInv = investimentos.reduce((s, i) => s + i.valorAtual, 0);
    const totalAport = investimentos.reduce((s, i) => s + i.aportado, 0);
    const saldo = totalRec - totalDesp;
    const taxaPoup = totalRec > 0 ? ((saldo / totalRec) * 100).toFixed(1) : '0';

    const porCategoria = Object.entries(
      despesas.reduce<Record<string, number>>((acc, d) => {
        acc[d.categoria] = (acc[d.categoria] ?? 0) + d.valor;
        return acc;
      }, {}),
    )
      .filter(([, total]) => total > 0)
      .sort((a, b) => b[1] - a[1]);

    const mesNum = (data: string) => Number(data?.slice(5, 7)) || 0;
    const porMes = Array.from({ length: 12 }, (_, i) => i + 1)
      .map((m) => ({
        mes: m,
        receitas: receitas.filter((r) => mesNum(r.data) === m).reduce((s, r) => s + r.valor, 0),
        despesas: despesas.filter((d) => mesNum(d.data) === m).reduce((s, d) => s + d.valor, 0),
      }))
      .filter((m) => m.receitas > 0 || m.despesas > 0);

    const hoje = new Date().toISOString().slice(0, 10);
    const vencidos = pagar.filter((p) => !p.liquidadoEm && p.vencimento < hoje).length;
    const aReceber = receber.filter((r) => !r.liquidadoEm).reduce((s, r) => s + r.valor, 0);

    return [
      'DADOS FINANCEIROS DO UTILIZADOR (em R$):',
      '',
      'RESUMO GERAL:',
      `- Total de Receitas: ${fmt(totalRec)} (${receitas.length} lançamentos)`,
      `- Total de Despesas: ${fmt(totalDesp)} (${despesas.length} lançamentos)`,
      `- Saldo: ${fmt(saldo)}`,
      `- Taxa de Poupança: ${taxaPoup}%`,
      `- Carteira de Investimentos (valor atual): ${fmt(totalInv)} | Aportado: ${fmt(totalAport)} | Rendimento: ${fmt(totalInv - totalAport)}`,
      `- Contas a Receber (pendentes): ${fmt(aReceber)}`,
      `- Contas vencidas a pagar: ${vencidos}`,
      '',
      'DESPESAS POR CATEGORIA:',
      ...porCategoria.map(
        ([cat, total]) =>
          `- ${cat}: ${fmt(total)} (${totalDesp > 0 ? ((total / totalDesp) * 100).toFixed(1) : 0}% do total)`,
      ),
      '',
      'HISTÓRICO MENSAL:',
      ...porMes.map(
        (m) =>
          `- Mês ${m.mes}: Receitas ${fmt(m.receitas)} | Despesas ${fmt(m.despesas)} | Saldo ${fmt(m.receitas - m.despesas)}`,
      ),
      '',
      'INVESTIMENTOS:',
      ...(investimentos.length
        ? investimentos.map(
            (i) =>
              `- ${i.ativo} (${i.tipo}): Aportado ${fmt(i.aportado)}, Atual ${fmt(i.valorAtual)}, Rendimento ${fmt(i.valorAtual - i.aportado)}`,
          )
        : ['Nenhum investimento cadastrado']),
      '',
      'ÚLTIMAS DESPESAS:',
      ...despesas
        .slice(-15)
        .reverse()
        .map((d) => `- ${d.data} | ${d.descricao} | ${fmt(d.valor)} | ${d.categoria}`),
    ].join('\n');
  }
}
