import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BillType {
  PAGAR = 'PAGAR',
  RECEBER = 'RECEBER',
}

const moneyTransformer = {
  to: (v: number) => v,
  from: (v: string) => parseFloat(v),
};

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar', length: 20 })
  type: BillType;

  // credor (PAGAR) ou devedor (RECEBER)
  @Column({ type: 'varchar', length: 200 })
  contraparte: string;

  @Column({ type: 'varchar', length: 10 })
  vencimento: string; // YYYY-MM-DD

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: moneyTransformer })
  valor: number;

  @Column({ type: 'varchar', length: 200, default: '' })
  descricao: string;

  // null = ainda pendente
  @Column({ type: 'varchar', length: 10, nullable: true, default: null })
  liquidadoEm: string | null;

  @Column({ type: 'varchar', length: 50 })
  forma: string;

  // apenas relevante para PAGAR
  @Column({ type: 'boolean', default: false })
  recorrente: boolean;

  @Column({ type: 'text', default: '' })
  obs: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
