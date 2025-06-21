# Configuração das Variáveis de Ambiente

## Data: 10 de Janeiro de 2025

### Objetivo
Documentar a configuração das variáveis de ambiente necessárias para o funcionamento do projeto Dimdim.

### Variáveis Necessárias

#### 1. Configurações do Supabase
Para conectar a aplicação ao banco de dados Supabase, são necessárias as seguintes variáveis:

```env
# URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Chave pública (anon key) do Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Chave de serviço do Supabase (opcional, para operações administrativas)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### 2. Configurações Gerais
```env
# Ambiente de desenvolvimento (dev, test, prod)
NODE_ENV=development

# URL base da aplicação (para produção)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Como Obter as Chaves do Supabase

1. **Acesse o Dashboard do Supabase**
   - Vá para https://supabase.com/dashboard
   - Faça login na sua conta

2. **Selecione seu Projeto**
   - Clique no projeto Dimdim (ou crie um novo)

3. **Navegue até Configurações**
   - No menu lateral, clique em "Settings"
   - Depois clique em "API"

4. **Copie as Chaves**
   - **URL**: Copie a "Project URL"
   - **ANON KEY**: Copie a "anon public" key
   - **SERVICE ROLE**: Copie a "service_role" key (mantenha secreta!)

### Configuração Local

#### Passo 1: Criar arquivo de ambiente
```bash
# Na raiz do projeto
touch .env.local
```

#### Passo 2: Adicionar as variáveis
Abra o arquivo `.env.local` e adicione:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Passo 3: Reiniciar o servidor
```bash
npm run dev
```

### Configuração para Produção

#### Vercel
1. Acesse o dashboard da Vercel
2. Selecione o projeto Dimdim
3. Vá em Settings > Environment Variables
4. Adicione cada variável individualmente

#### Outras Plataformas de Deploy
- **Netlify**: Environment Variables na seção Build & Deploy
- **Railway**: Variables na seção do projeto
- **Heroku**: Config Vars nas configurações do app

### Segurança das Variáveis

#### ✅ Boas Práticas
- Nunca commite arquivos `.env*` no Git
- Use `NEXT_PUBLIC_` apenas para variáveis que podem ser expostas no browser
- Mantenha `SERVICE_ROLE_KEY` sempre secreta
- Use ambientes diferentes para dev/test/prod

#### ⚠️ Atenção
- A `ANON KEY` é segura para usar no frontend (tem permissões limitadas)
- A `SERVICE_ROLE_KEY` tem permissões administrativas - NUNCA exponha no frontend
- O `.gitignore` já está configurado para ignorar arquivos de ambiente

### Verificação da Configuração

Para verificar se as variáveis estão configuradas corretamente:

1. **No código** (lib/supabase.ts):
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
```

2. **Teste da conexão**:
```bash
npm run dev
# Acesse http://localhost:3000
# Tente fazer login - se funcionar, a configuração está correta
```

### Troubleshooting

#### Erro: "supabaseUrl is required"
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` está definida
- Reinicie o servidor de desenvolvimento

#### Erro: "supabaseAnonKey is required"
- Verifique se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está definida
- Confirme se não há espaços extras na variável

#### Erro de conexão com banco
- Verifique se as chaves estão corretas no dashboard do Supabase
- Confirme se o projeto Supabase está ativo

### Template de Arquivo .env.local
```env
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Configurações gerais
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Próximos Passos
- [ ] Configurar variáveis no ambiente de produção
- [ ] Implementar validação de variáveis de ambiente
- [ ] Adicionar logs para debug de configuração
- [ ] Documentar processo de rotação de chaves 