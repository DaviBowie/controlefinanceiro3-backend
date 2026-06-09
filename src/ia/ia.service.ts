import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { IaContextService } from './ia-context.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Es o Jarvis, um assistente financeiro pessoal especialista, direto e honesto.
Respondes sempre em portugues do Brasil, com base nos dados financeiros reais do utilizador
que te sao fornecidos no contexto. Usa numeros concretos, evita conselhos genericos e
nunca inventes dados que nao estejam no contexto.`;

const ANALISE_PROMPT = `Analisa os meus dados financeiros e fornece uma analise completa e
personalizada em portugues do Brasil, estruturada exatamente com estas seccoes em markdown:

## Diagnostico Geral
Avalia a saude financeira atual de forma direta e honesta.

## Pontos Positivos
Lista o que estou a fazer bem.

## Alertas e Riscos
Identifica problemas, gastos excessivos, padroes preocupantes.

## Padroes Detectados
Identifica sazonalidade, categorias que crescem, comportamentos recorrentes.

## Recomendacoes Prioritarias
Lista de 3 a 5 acoes concretas que devo tomar agora.

## Projecao
Com base nos dados, projeta a situacao financeira em 3 e 6 meses.

Se direto, usa numeros reais e evita conselhos genericos.`;

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private readonly groq: Groq;
  private readonly model: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly context: IaContextService,
  ) {
    this.groq = new Groq({
      apiKey: this.config.get<string>('GROQ_API_KEY'),
    });
    this.model = this.config.get<string>(
      'GROQ_MODEL',
      'llama-3.3-70b-versatile',
    );
  }

  /** Cria uma nova sessao de chat e devolve o seu id. */
  async createChat(): Promise<{ id: string }> {
    const chat = await this.prisma.chat.create({ data: {} });
    return { id: chat.id };
  }

  /**
   * Responde a uma pergunta do utilizador. O backend recolhe o contexto
   * financeiro da BD e junta-o ao historico da sessao antes de chamar a Groq.
   */
  async chat(message: string, chatId?: string): Promise<{ response: string; chatId: string }> {
    const id = chatId ?? (await this.createChat()).id;
    const history = await this.loadHistory(id);
    const contexto = await this.context.build();

    const response = await this.complete([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `CONTEXTO ATUAL:\n${contexto}` },
      ...history,
      { role: 'user', content: message },
    ]);

    await this.saveHistory(id, [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: response },
    ]);

    return { response, chatId: id };
  }

  /** Gera a analise financeira completa a partir dos dados na BD. */
  async analise(): Promise<{ response: string }> {
    const contexto = await this.context.build();
    const response = await this.complete([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `${ANALISE_PROMPT}\n\n${contexto}` },
    ]);
    return { response };
  }

  // --- helpers ---

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
        'Nao foi possivel contactar o servico de IA. Verifica a GROQ_API_KEY.',
      );
    }
  }

  private async loadHistory(chatId: string): Promise<ChatMessage[]> {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    const raw = (chat?.messages as unknown as ChatMessage[]) ?? [];
    // Limita o historico para nao estourar o limite de tokens.
    return raw.slice(-10);
  }

  private async saveHistory(
    chatId: string,
    messages: ChatMessage[],
  ): Promise<void> {
    await this.prisma.chat.upsert({
      where: { id: chatId },
      // Guarda apenas as ultimas 20 mensagens.
      update: { messages: messages.slice(-20) as object },
      create: { id: chatId, messages: messages.slice(-20) as object },
    });
  }
}
