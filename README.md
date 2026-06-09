# Controle Financeiro - Backend (NestJS)

API REST em NestJS + Prisma + PostgreSQL para a aplicacao de Controle Financeiro.
Inclui um modulo de IA (Groq) isolado do frontend.

## Stack

- **NestJS 10** + TypeScript
- **Prisma 5** (ORM) + **PostgreSQL 16**
- **class-validator** para validacao de DTOs
- **groq-sdk** para o assistente de IA

## Pre-requisitos

- Node.js 20+
- Docker (para o PostgreSQL) ou um PostgreSQL local
- Uma chave da Groq: https://console.groq.com/keys

## Arranque rapido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar o ambiente
cp .env.example .env        # depois edita o .env e poe a tua GROQ_API_KEY

# 3. Subir a base de dados (PostgreSQL via Docker)
npm run db:up

# 4. Criar as tabelas (gera o Prisma Client + aplica a migracao)
npm run prisma:migrate -- --name init

# 5. Arrancar em modo desenvolvimento
npm run start:dev
```

A API fica disponivel em `http://localhost:8000/api`.

## Endpoints

### Despesas (modulo CRUD de referencia)
| Metodo | Rota                | Descricao              |
|--------|---------------------|------------------------|
| GET    | `/api/despesas`     | Lista todas            |
| GET    | `/api/despesas/:id` | Obtem uma              |
| POST   | `/api/despesas`     | Cria                   |
| PATCH  | `/api/despesas/:id` | Atualiza (parcial)     |
| DELETE | `/api/despesas/:id` | Remove                 |

### IA (Groq)
| Metodo | Rota             | Body                          | Descricao                          |
|--------|------------------|-------------------------------|------------------------------------|
| POST   | `/api/ia/chats`  | -                             | Cria sessao de chat -> `{ id }`    |
| POST   | `/api/ia/chat`   | `{ chatId?, message }`        | Pergunta livre -> `{ response }`   |
| POST   | `/api/ia/analise`| -                             | Analise completa -> `{ response }` |

## Proximos modulos (fase de iteracao)

Os modulos `receitas`, `contas-receber`, `contas-pagar` e `investimentos` seguem
exatamente o mesmo padrao do modulo `despesas` (controller + service + DTOs).
Os models ja estao todos definidos em `prisma/schema.prisma`.

## Estrutura

```
src/
├── main.ts                 # bootstrap (prefixo /api, ValidationPipe, CORS)
├── app.module.ts
├── prisma/                 # PrismaService global
├── despesas/               # modulo CRUD de referencia
│   ├── dto/
│   ├── despesas.controller.ts
│   ├── despesas.service.ts
│   └── despesas.module.ts
└── ia/                     # modulo de IA (Groq)
    ├── dto/
    ├── ia-context.service.ts   # le os dados da BD e monta o contexto
    ├── ia.service.ts           # fala com a Groq
    ├── ia.controller.ts
    └── ia.module.ts
```
