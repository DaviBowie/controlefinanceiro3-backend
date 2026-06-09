import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { Chat, ChatMessage } from './chat.entity';
import { IaContextService } from './ia-context.service';

const SYSTEM_PROMPT = `És o Jarvis, um assistente financeiro pessoal especialista, direto e honesto.
Respondes sempre em português do Brasil, com base nos dados financeiros reais do utilizador
que te são fornecidos no contexto. Usa números concretos, evita conselhos genéricos e
nunca inventes dados que não estejam no contexto.`;

const ANALISE_PROMPT = `Analisa os meus dados financeiros e fornece uma análise completa e
personalizada em português do Brasil, estruturada exatamente com estas secções em markdown:

## Diagnóstico Geral
Avalia a saúde financeira atual de forma direta e honesta.

## Pontos Positivos
Lista o que estou a fazer bem.

## Alertas e Riscos
Identifica problemas, gastos excessivos, padrões preocupantes.

## Padrões Detectados
Identifica sazonalidade, categorias que crescem, comportamentos recorrentes.

## Recomendações Prioritárias
Lista de 3 a 5 ações concretas que devo tomar agora.

## Projeção
Com base nos dados, projeta a situação financeira em 3 e 6 meses.

Sê direto, usa números reais e evita conselhos genéricos.`;

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private readonly groq: Groq;
  private readonly model: string;

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    private readonly config: ConfigService,
    private readonly context: IaContextService,
  ) {
    this.groq = new Groq({ apiKey: this.config.get<string>('GROQ_API_KEY') });
    this.model = this.config.get<string>('GROQ_MODEL', 'llama-3.3-70b-versatile');
  }

  async createChat(userId: number): Promise<{ id: string }> {
    const chat = this.chatRepo.create({ messages: [], userId });
    const saved = await this.chatRepo.save(chat);
    return { id: saved.id };
  }

  async chat(
    message: string,
    userId: number,
    chatId?: string,
  ): Promise<{ response: string; chatId: string }> {
    const id = chatId ?? (await this.createChat(userId)).id;
    const history = await this.loadHistory(id, userId);
    const contexto = await this.context.build(userId);

    const response = await this.complete([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `CONTEXTO ATUAL:\n${contexto}` },
      ...history,
      { role: 'user', content: message },
    ]);

    await this.saveHistory(id, userId, [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: response },
    ]);

    return { response, chatId: id };
  }

  async analise(userId: number): Promise<{ response: string }> {
    const contexto = await this.context.build(userId);
    const response = await this.complete([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `${ANALISE_PROMPT}\n\n${contexto}` },
    ]);
    return { response };
  }

  private async complete(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  ): Promise<string> {
    try {
      const completion = await this.groq.chat.completions.create({
        model: this.model,
        temperature: 0.4,
        messages,
      });
      return completion.choices[0]?.message?.content ?? '';
    } catch (err) {
      this.logger.error('Falha ao chamar a API da Groq', err as Error);
      throw new ServiceUnavailableException(
        'Não foi possível contactar o serviço de IA. Verifica a GROQ_API_KEY.',
      );
    }
  }

  private async loadHistory(chatId: string, userId: number): Promise<ChatMessage[]> {
    const chat = await this.chatRepo.findOneBy({ id: chatId, userId });
    return (chat?.messages ?? []).slice(-10);
  }

  private async saveHistory(
    chatId: string,
    userId: number,
    messages: ChatMessage[],
  ): Promise<void> {
    const trimmed = messages.slice(-20);
    await this.chatRepo.upsert({ id: chatId, userId, messages: trimmed }, ['id']);
  }
}
