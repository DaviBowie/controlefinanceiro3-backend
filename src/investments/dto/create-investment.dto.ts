import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInvestmentDto {
  @IsString()
  @MaxLength(100)
  ativo: string;

  @IsString()
  @MaxLength(50)
  tipo: string;

  @IsDateString()
  dataCompra: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  aportado: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorAtual: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  vencimento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  obs?: string;
}
