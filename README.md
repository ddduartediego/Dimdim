# 💰 Dimdim - Gestão Financeira Pessoal

Uma aplicação moderna e intuitiva para controle das suas finanças pessoais, desenvolvida com Next.js, Material-UI e Supabase.

## 🚀 Funcionalidades

- ✅ **Autenticação Segura**: Login e registro com Supabase Auth
- ✅ **Dashboard Intuitivo**: Visão geral do seu saldo, receitas e despesas
- ✅ **Gestão de Transações**: Adicione, edite e remova receitas e despesas
- ✅ **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- ✅ **Segurança Avançada**: Row Level Security (RLS) para proteção dos dados
- ✅ **Design Moderno**: Interface limpa e profissional com Material-UI

## 🛠️ Stack Técnica

- **Frontend**: Next.js 15.3.2 com App Router
- **TypeScript**: Para tipagem estática e maior segurança
- **UI/UX**: Material-UI 6.x com tema personalizado
- **Formulários**: React Hook Form + Zod para validação
- **Backend**: Supabase (PostgreSQL + Auth + APIs)
- **Estilização**: Tailwind CSS + Material-UI
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## ⚡ Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd dimdim
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
```

4. **Configure o banco de dados**
- Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
- Vá em "SQL Editor"
- Cole e execute o conteúdo do arquivo `lib/database.sql`

5. **Execute a aplicação**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🎯 Como Usar

### 1. **Cadastro/Login**
- Acesse a aplicação e crie uma nova conta
- Ou faça login com uma conta existente

### 2. **Dashboard**
- Visualize seu saldo atual, receitas e despesas
- Acompanhe suas transações recentes
- Navegue facilmente pelas funcionalidades

### 3. **Gerenciar Transações**
- Clique no botão "+" para adicionar uma nova transação
- Preencha: valor, descrição, tipo (receita/despesa) e data
- Edite ou exclua transações existentes conforme necessário

## 📁 Estrutura do Projeto

```
dimdim/
├── app/                    # Páginas da aplicação (App Router)
│   ├── (auth)/            # Páginas de autenticação
│   ├── dashboard/         # Dashboard principal
│   ├── transactions/      # Gestão de transações
│   └── layout.tsx         # Layout raiz
├── components/            # Componentes reutilizáveis
├── contexts/              # Contextos React (AuthContext)
├── lib/                   # Utilitários e configurações
│   ├── supabase.ts       # Cliente Supabase
│   ├── validations.ts    # Schemas de validação
│   ├── utils.ts          # Funções utilitárias
│   └── database.sql      # Script do banco de dados
├── types/                 # Tipos TypeScript
└── step-by-step/         # Documentação detalhada
```

## 🔒 Segurança

- **Row Level Security (RLS)**: Cada usuário só acessa seus próprios dados
- **Validação de Dados**: Validação tanto no frontend quanto no backend
- **Autenticação JWT**: Tokens seguros gerenciados pelo Supabase
- **Variáveis de Ambiente**: Credenciais protegidas

## 📊 Status do Projeto

**Versão Atual**: 1.0 MVP
**Progresso**: 5/7 fases concluídas (71%)

### ✅ Funcionalidades Implementadas
- [x] Sistema de autenticação completo
- [x] Dashboard com resumo financeiro
- [x] CRUD completo de transações
- [x] Interface responsiva
- [x] Validações e segurança

### 🚧 Próximas Funcionalidades
- [ ] Gráficos interativos com Recharts
- [ ] Relatórios avançados
- [ ] Filtros por período
- [ ] Exportação de dados
- [ ] Metas financeiras

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas, sugestões ou problemas:
- Abra uma issue no GitHub
- Entre em contato através do email: [seu-email]

---

**Desenvolvido com ❤️ usando Next.js, Material-UI e Supabase** 