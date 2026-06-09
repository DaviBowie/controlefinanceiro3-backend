import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DespesasModule } from './despesas/despesas.module';
import { IaModule } from './ia/ia.module';

@Module({
  imports: [
    // Carrega o .env e disponibiliza o ConfigService em toda a app.
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,

    // Modulos de dominio (mais serao adicionados na fase de iteracao:
    // ReceitasModule, ContasReceberModule, ContasPagarModule, InvestimentosModule).
    DespesasModule,

    // Modulo de IA (Groq) - isolado do frontend.
    IaModule,
  ],
})
export class AppModule {}
