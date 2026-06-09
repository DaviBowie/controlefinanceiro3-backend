import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { TransactionType } from '../transaction.entity';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsDateString()
  data: string;

  @IsString()
  @MaxLength(200)
  descricao: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valor: number;

  @IsString()
  @MaxLength(100)
  categoria: string;

  @IsString()
  @MaxLength(50)
  forma: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  parcela?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  obs?: string;
}
