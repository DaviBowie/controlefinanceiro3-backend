import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Recolhe TODOS os dados financeiros diretamente da base de dados e monta um
 * bloco de texto com o contexto que e enviado ao modelo de IA.
 *
 * Isto e o cerne da nova arquitetura: o frontend ja nao constroi o contexto
 * nem conhece os dados todos -- o backend e a fonte da verdade.
 */
@Injectable()
export class IaContextService {
  constructor(private readonly prisma: PrismaService) {}

  async build(): Promise<string> {
    const [receitas, despesas, receber, pagar, investimentos] =
      await Promise.all([
        this.prisma.receita.findMany(),
        this.prisma.despesa.findMany(),
        this.prisma.contaReceber.findMany(),
        this.prisma.contaPagar.findMany(),
        this.prisma.investimento.findMany(),
      ]);

    const num = (v: unknown) => Number(v);

    const totalRec = receitas.reduce((s, r) => s + num(r.valor), 0);
    const totalDesp = despesas.reduce((s, d) => s + num(d.valor), 0);
    const totalInv = investimentos.reduce((s, i) => s + num(i.valorAtual), 0);
    const totalAport = investimentos.reduce((s, i) => s + num(i.aportado), 0);
    const saldo = totalRec - totalDesp;
    const taxaPoup = totalRec > 0 ? ((saldo / totalRec) * 100).toFixed(1) : '0';

    // Despesas por categoria (ordenadas da maior para a menor).
    const porCategoria = Object.entries(
      despesas.reduce<Record<string, number>>((acc, d) => {
        acc[d.categoria] = (acc[d.categoria] ?? 0) + num(d.valor);
        return acc;
      }, {}),
    )
      .filter(([, total]) => total > 0)
      .sort((a, b) => b[1] - a[1]);

    // Historico mensal (mes 1..12) com base no campo "data" (YYYY-MM-DD).
    const mes = (data: string) => Number(data?.slice(5, 7)) || 0;
    const porMes = Array.from({ length: 12 }, (_, i) => i + 1)
      .map((m) => ({
        mes: m,
        receitas: receitas
          .filter((r) => mes(r.data) === m)
          .reduce((s, r) => s + num(r.valor), 0),
        despesas: despesas
          .filter((d) => mes(d.data) === m)
          .reduce((s, d) => s + num(d.valor), 0),
      }))
      .filter((m) => m.receitas > 0 || m.despesas > 0);

    const hoje = new Date().toISOString().slice(0, 10);
    const vencidos = pagar.filter(
      (p) => !p.pagoEm && p.vencimento < hoje,
    ).length;
    const aReceber = receber
      .filter((r) => !r.recebidoEm)
      .reduce((s, r) => s + num(r.valor), 0);

    return [
      'DADOS FINANCEIROS DO UTILIZADOR (em R$):',
      '',
      'RESUMO GERAL:',
      `- Total de Receitas: ${fmt(totalRec)} (${receitas.length} lancamentos)`,
      `- Total de Despesas: ${fmt(totalDesp)} (${despesas.length} lancamentos)`,
      `- Saldo: ${fmt(saldo)}`,
      `- Taxa de Poupanca: ${taxaPoup}%`,
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
      'HISTORICO MENSAL:',
      ...porMes.map(
        (m) =>
          `- Mes ${m.mes}: Receitas ${fmt(m.receitas)} | Despesas ${fmt(m.despesas)} | Saldo ${fmt(m.receitas - m.despesas)}`,
      ),
      '',
      'INVESTIMENTOS:',
      ...(investimentos.length
        ? investimentos.map(
            (i) =>
              `- ${i.ativo} (${i.tipo}): Aportado ${fmt(num(i.aportado))}, Atual ${fmt(num(i.valorAtual))}, Rendimento ${fmt(num(i.valorAtual) - num(i.aportado))}`,
          )
        : ['Nenhum investimento cadastrado']),
      '',
      'ULTIMAS DESPESAS:',
      ...despesas
        .slice(-15)
        .reverse()
        .map(
          (d) =>
            `- ${d.data} | ${d.descricao} | ${fmt(num(d.valor))} | ${d.categoria}`,
        ),
    ].join('\n');
  }
}
