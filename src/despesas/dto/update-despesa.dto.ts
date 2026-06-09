import { PartialType } from '@nestjs/mapped-types';
import { CreateDespesaDto } from './create-despesa.dto';

// Torna todos os campos do CreateDespesaDto opcionais, mantendo as validacoes.
export class UpdateDespesaDto extends PartialType(CreateDespesaDto) {}
