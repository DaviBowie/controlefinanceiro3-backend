import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './chat.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Bill } from '../bills/bill.entity';
import { Investment } from '../investments/investment.entity';
import { IaController } from './ia.controller';
import { IaService } from './ia.service';
import { IaContextService } from './ia-context.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Transaction, Bill, Investment])],
  controllers: [IaController],
  providers: [IaService, IaContextService],
})
export class IaModule {}
