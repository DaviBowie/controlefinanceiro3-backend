import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDespesaDto {
  // Aceita "YYYY-MM-DD" (formato ISO de data) vindo do frontend.
  @IsDateString()
  data: string;

  @IsString()
  @MaxLength(200)
  descricao: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valor: number;

  @IsString()
  categoria: string;

  @IsString()
  forma: string;

  @IsOptional()
  @IsBoolean()
  pago?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  parcela?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  obs?: string;
}
