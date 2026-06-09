import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ChatDto {
  // Opcional: se nao vier, o servico cria uma nova sessao de chat.
  @IsOptional()
  @IsString()
  chatId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message: string;
}
