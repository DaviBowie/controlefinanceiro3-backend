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
import { BillType } from '../bill.entity';

export class CreateBillDto {
  @IsEnum(BillType)
  type: BillType;

  @IsString()
  @MaxLength(200)
  contraparte: string;

  @IsDateString()
  vencimento: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valor: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descricao?: string;

  // data em que foi liquidado (pago/recebido); omitir = pendente
  @IsOptional()
  @IsDateString()
  liquidadoEm?: string;

  @IsString()
  @MaxLength(50)
  forma: string;

  @IsOptional()
  @IsBoolean()
  recorrente?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  obs?: string;
}
