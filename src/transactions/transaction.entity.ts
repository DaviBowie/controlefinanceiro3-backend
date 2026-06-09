import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionType {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA',
}

const moneyTransformer = {
  to: (v: number) => v,
  from: (v: string) => parseFloat(v),
};

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar', length: 20 })
  type: TransactionType;

  @Column({ type: 'varchar', length: 10 })
  data: string; // YYYY-MM-DD

  @Column({ type: 'varchar', length: 200 })
  descricao: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: moneyTransformer })
  valor: number;

  @Column({ type: 'varchar', length: 100 })
  categoria: string;

  @Column({ type: 'varchar', length: 50 })
  forma: string;

  // pago (DESPESA) ou recebido (RECEITA)
  @Column({ type: 'boolean', default: true })
  status: boolean;

  // número da parcela, ex: "3/12" — usado apenas em DESPESA
  @Column({ type: 'varchar', length: 20, default: '' })
  parcela: string;

  @Column({ type: 'text', default: '' })
  obs: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
