import { Body, Controller, Post } from '@nestjs/common';
import { IaService } from './ia.service';
import { ChatDto } from './dto/chat.dto';

@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  /** Cria uma nova sessao de chat. */
  @Post('chats')
  createChat() {
    return this.iaService.createChat();
  }

  /** Pergunta livre ao assistente (contexto recolhido da BD pelo backend). */
  @Post('chat')
  chat(@Body() dto: ChatDto) {
    return this.iaService.chat(dto.message, dto.chatId);
  }

  /** Analise financeira completa e estruturada. */
  @Post('analise')
  analise() {
    return this.iaService.analise();
  }
}
