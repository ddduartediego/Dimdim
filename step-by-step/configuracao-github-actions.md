# Configuração do GitHub Actions para CI/CD

## Data: 10 de Janeiro de 2025

### Objetivo
Configurar pipeline de CI/CD automatizado para o projeto Dimdim usando GitHub Actions.

### Benefícios do CI/CD
- **Qualidade**: Testes automáticos em cada commit
- **Segurança**: Verificação de vulnerabilidades
- **Eficiência**: Deploy automático para produção
- **Confiabilidade**: Processo padronizado e repetível

### Estrutura de Workflows Proposta

#### 1. Workflow de CI (Continuous Integration)
**Arquivo**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
        
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linter
      run: npm run lint
      
    - name: Run type checking
      run: npx tsc --noEmit
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Security audit
      run: npm audit --audit-level high
```

#### 2. Workflow de Deploy (Continuous Deployment)
**Arquivo**: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

#### 3. Workflow de Análise de Código
**Arquivo**: `.github/workflows/codeql.yml`

```yaml
name: CodeQL

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '30 2 * * 1'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    
    strategy:
      fail-fast: false
      matrix:
        language: [ 'javascript' ]
        
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: ${{ matrix.language }}
        
    - name: Autobuild
      uses: github/codeql-action/autobuild@v3
      
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
```

### Configuração de Secrets

#### Secrets Necessários
Para configurar no GitHub (Settings > Secrets and variables > Actions):

1. **NEXT_PUBLIC_SUPABASE_URL**: URL do projeto Supabase
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Chave pública do Supabase
3. **VERCEL_TOKEN**: Token de acesso da Vercel
4. **ORG_ID**: ID da organização na Vercel
5. **PROJECT_ID**: ID do projeto na Vercel

#### Como Obter os Secrets da Vercel

1. **Vercel Token**:
   ```bash
   npx vercel login
   npx vercel --token
   ```

2. **Org ID e Project ID**:
   ```bash
   npx vercel link
   # Os IDs aparecerão no arquivo .vercel/project.json
   ```

### Configuração de Badges

Adicionar ao README.md:

```markdown
[![CI](https://github.com/ddduartediego/dimdim/workflows/CI/badge.svg)](https://github.com/ddduartediego/dimdim/actions)
[![Deploy](https://github.com/ddduartediego/dimdim/workflows/Deploy/badge.svg)](https://github.com/ddduartediego/dimdim/actions)
[![CodeQL](https://github.com/ddduartediego/dimdim/workflows/CodeQL/badge.svg)](https://github.com/ddduartediego/dimdim/actions)
```

### Configuração de Proteção de Branch

#### Regras para a Branch Main
1. Acesse: Settings > Branches
2. Clique em "Add rule"
3. Configurar:
   - **Branch name pattern**: `main`
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Require pull request reviews
   - ✅ Dismiss stale reviews
   - ✅ Include administrators

### Scripts de Package.json

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "build:analyze": "ANALYZE=true npm run build"
  }
}
```

### Implementação Gradual

#### Fase 1: CI Básico
- [ ] Criar workflow de CI
- [ ] Configurar linting e type checking
- [ ] Implementar testes básicos

#### Fase 2: Análise de Código
- [ ] Configurar CodeQL
- [ ] Adicionar análise de vulnerabilidades
- [ ] Implementar análise de qualidade

#### Fase 3: Deploy Automático
- [ ] Configurar deploy para staging
- [ ] Implementar deploy para produção
- [ ] Configurar rollback automático

### Monitoramento e Métricas

#### Métricas Importantes
- **Build Success Rate**: Taxa de sucesso dos builds
- **Test Coverage**: Cobertura de testes
- **Deploy Frequency**: Frequência de deploys
- **Mean Time to Recovery**: Tempo médio de recuperação

#### Ferramentas Recomendadas
- **Dependabot**: Atualizações automáticas de dependências
- **Renovate**: Gerenciamento de dependências
- **Lighthouse CI**: Análise de performance
- **Bundle Analyzer**: Análise do tamanho do bundle

### Troubleshooting

#### Problemas Comuns

1. **Build Failing**:
   - Verificar dependências no package.json
   - Confirmar variáveis de ambiente
   - Checar sintaxe do YAML

2. **Tests Failing**:
   - Verificar configuração do Jest
   - Confirmar mocks de dependências
   - Validar setup dos testes

3. **Deploy Failing**:
   - Verificar secrets configurados
   - Confirmar permissões de acesso
   - Validar configuração da Vercel

### Exemplo de Configuração Completa

#### Estrutura de Diretórios
```
.github/
├── workflows/
│   ├── ci.yml
│   ├── deploy.yml
│   └── codeql.yml
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   └── feature_request.md
└── PULL_REQUEST_TEMPLATE.md
```

### Próximos Passos
- [ ] Criar os arquivos de workflow
- [ ] Configurar secrets no GitHub
- [ ] Testar pipeline com PR
- [ ] Configurar proteção de branch
- [ ] Adicionar badges ao README
- [ ] Implementar testes unitários
- [ ] Configurar análise de código 