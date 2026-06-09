import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/strategies/jwt.strategy';
import { IaService } from './ia.service';
import { ChatDto } from './dto/chat.dto';

@UseGuards(JwtAuthGuard)
@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  /** Pergunta livre ao assistente (contexto recolhido da BD pelo backend). */
  @Post('chat')
  chat(@Body() dto: ChatDto, @CurrentUser() user: AuthUser) {
    return this.iaService.chat(dto.message, user.userId, dto.chatId);
  }

  /** Análise financeira completa e estruturada. */
  @Post('analise')
  analise(@CurrentUser() user: AuthUser) {
    return this.iaService.analise(user.userId);
  }
}
