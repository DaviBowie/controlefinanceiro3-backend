import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transactions/transaction.entity';
import { Bill } from './bills/bill.entity';
import { Investment } from './investments/investment.entity';
import { User } from './users/user.entity';
import { Chat } from './ia/chat.entity';
import { TransactionsModule } from './transactions/transactions.module';
import { BillsModule } from './bills/bills.module';
import { InvestmentsModule } from './investments/investments.module';
import { IaModule } from './ia/ia.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [Transaction, Bill, Investment, User, Chat],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),

    UsersModule,
    AuthModule,
    TransactionsModule,
    BillsModule,
    InvestmentsModule,
    IaModule,
  ],
})
export class AppModule {}
