# Script de Setup da Database PostgreSQL - Dimdim

## 📋 Visão Geral

O arquivo `database-setup.sql` é um script unificado para configuração completa da database PostgreSQL do sistema Dimdim. Ele consolida e aprimora todos os scripts SQL existentes em uma única solução robusta.

## 🚀 Características Principais

### ✅ Estrutura Completa
- **3 Tabelas principais**: categories, transactions, budgets
- **4 Views otimizadas**: Para consultas complexas
- **16+ Índices**: Para máxima performance
- **12 Políticas RLS**: Segurança por usuário
- **11 Categorias padrão**: Pré-definidas no sistema

### 🔒 Segurança
- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Isolamento por usuário**: Cada usuário só acessa seus próprios dados
- **Validação de dados**: Constraints de check para integridade

### ⚡ Performance
- **Índices compostos** para consultas frequentes
- **Views otimizadas** para relatórios
- **Triggers automáticos** para campos de auditoria

## 📁 Estrutura das Tabelas

### 🏷️ Categories
```sql
- Categorias de transações (padrão e personalizadas)
- Campos: id, user_id, name, color, icon, is_default
- Políticas: Usuários veem suas categorias + padrão do sistema
```

### 💰 Transactions  
```sql
- Transações financeiras (receitas e despesas)
- Campos: id, user_id, category_id, amount, description, type, date
- Relacionamento: Opcional com categories
```

### 📊 Budgets
```sql
- Orçamentos mensais por categoria
- Campos: id, user_id, category_id, amount, month, year
- Constraint: Único por usuário/categoria/mês/ano
```

## 🔧 Como Usar

### 1️⃣ Acesso ao Supabase
```bash
1. Faça login no painel do Supabase
2. Selecione seu projeto
3. Vá para "SQL Editor"
```

### 2️⃣ Execução do Script
```sql
-- Copie todo o conteúdo do arquivo database-setup.sql
-- Cole no SQL Editor do Supabase
-- Clique em "Run" para executar
```

### 3️⃣ Verificação
O script mostrará um relatório automático:
```
====================================================================
RELATÓRIO DE SETUP DA DATABASE DIMDIM
====================================================================
Tabelas criadas: 3 de 3
Views criadas: 4 de 4  
Índices criados: 16
Políticas RLS criadas: 12
Categorias padrão inseridas: 11
====================================================================
SETUP CONCLUÍDO COM SUCESSO! ✅
A database está pronta para uso.
====================================================================
```

## 📈 Views Disponíveis

### 🔍 transactions_with_category
Transações com informações da categoria associada
```sql
SELECT * FROM transactions_with_category WHERE user_id = auth.uid();
```

### 📊 budget_statistics  
Estatísticas completas de orçamentos vs gastos
```sql
SELECT * FROM budget_statistics WHERE user_id = auth.uid();
```

### 📅 monthly_summary
Resumo mensal de receitas, despesas e saldo
```sql
SELECT * FROM monthly_summary WHERE user_id = auth.uid();
```

### 📈 category_statistics
Estatísticas de uso por categoria
```sql
SELECT * FROM category_statistics WHERE user_id = auth.uid();
```

## 🏷️ Categorias Padrão Incluídas

O script automaticamente cria estas categorias padrão:
- 🍽️ **Alimentação** (#FF9800)
- 🚗 **Transporte** (#2196F3)  
- 🏠 **Moradia** (#4CAF50)
- 🏥 **Saúde** (#F44336)
- 🎮 **Lazer** (#9C27B0)
- 📚 **Educação** (#3F51B5)
- 🛒 **Compras** (#E91E63)
- 🔧 **Serviços** (#607D8B)
- 📈 **Investimentos** (#795548)
- 💼 **Salário** (#4CAF50)
- ❓ **Outros** (#9E9E9E)

## ⚠️ Requisitos

### Sistema
- PostgreSQL 12+ (Supabase)
- Extensão `uuid-ossp` (incluída no script)
- Schema `auth` (disponível no Supabase)

### Permissões
- Acesso de superuser no database
- Permissão para criar tabelas, índices, views e políticas

## 🔄 Idempotência

O script é **idempotente**, ou seja:
- ✅ Pode ser executado múltiplas vezes
- ✅ Remove estruturas existentes antes de recriar
- ✅ Não duplica dados ou estruturas
- ✅ Seguro para re-execução

## 🛠️ Troubleshooting

### Erro: "Schema auth não encontrado"
```
⚠️ Certifique-se de estar executando no Supabase
💡 O schema auth é específico do Supabase
```

### Erro: "Permissão negada"
```
⚠️ Verifique se tem permissões de superuser
💡 No Supabase, use a aba SQL Editor com admin
```

### Erro: "Tabela já existe"
```
✅ Normal! O script remove e recria automaticamente
💡 Aguarde a conclusão completa do script
```

## 🚨 Importante

### ⚠️ Ambiente de Produção
- Execute primeiro em ambiente de desenvolvimento
- Faça backup antes de executar em produção
- Teste todas as funcionalidades após a execução

### 🔒 Dados Existentes
- O script preserva dados existentes quando possível
- Categorias padrão são inseridas com `ON CONFLICT DO NOTHING`
- Estruturas são recriadas mas dados permanecem

## 📝 Arquivos Relacionados

- **`database-setup.sql`** - Script principal (USE ESTE)
- **`database.sql`** - Script v1.0 (referência)
- **`database-v2.sql`** - Script v2.0 (referência)
- **`database-migration-v2.sql`** - Migração v1→v2 (referência)

## 📞 Suporte

Em caso de problemas:
1. Verifique o relatório de execução no final
2. Consulte a documentação em `step-by-step/database-setup-completo.md`
3. Verifique logs do PostgreSQL para erros específicos

---

**🎯 Objetivo**: Setup completo e otimizado da database em uma única execução
**📅 Criado**: 2025  
**🔖 Versão**: 1.0
**✅ Status**: Pronto para produção 