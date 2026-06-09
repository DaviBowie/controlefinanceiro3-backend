import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const moneyTransformer = {
  to: (v: number) => v,
  from: (v: string) => parseFloat(v),
};

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar', length: 100 })
  ativo: string;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @Column({ type: 'varchar', length: 10 })
  dataCompra: string; // YYYY-MM-DD

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: moneyTransformer })
  aportado: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: moneyTransformer })
  valorAtual: number;

  // YYYY-MM-DD ou '' para activos sem vencimento
  @Column({ type: 'varchar', length: 10, default: '' })
  vencimento: string;

  @Column({ type: 'text', default: '' })
  obs: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
