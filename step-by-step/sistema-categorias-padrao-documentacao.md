# Sistema de Categorias Padrão - Documentação Técnica

## 📋 Visão Geral
Sistema administrativo para gerenciamento de categorias padrão globais que ficam disponíveis para todos os usuários da aplicação Dimdim. Este documento detalha a arquitetura, implementação e funcionamento do sistema.

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Dados
```sql
-- Categorias com suporte a padrão global
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#1976D2',
    icon VARCHAR(50) DEFAULT 'category',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Regras:
-- user_id = NULL e is_default = true -> Categoria padrão global
-- user_id = UUID e is_default = false -> Categoria personalizada
```

### Políticas RLS (Row Level Security)
```sql
-- Visualização: usuários veem suas categorias + todas as padrão
CREATE POLICY "Users can view own categories and all defaults" 
ON categories FOR SELECT USING (
    auth.uid() = user_id OR is_default = true
);

-- Inserção: usuários apenas suas categorias, admin pode criar padrão
CREATE POLICY "Users can insert own categories" 
ON categories FOR INSERT WITH CHECK (
    (auth.uid() = user_id AND is_default = false) OR
    (user_id IS NULL AND is_default = true)
);
```

---

## 📁 Estrutura de Arquivos

### Páginas
- `app/settings/page.tsx` - Página principal de configurações administrativas

### Componentes Administrativos
- `components/settings/AdminCategoriesList.tsx` - Lista de categorias padrão
- `components/settings/AdminCategoryCard.tsx` - Card individual de categoria
- `components/settings/AdminCategoryForm.tsx` - Formulário de criação/edição

### Hooks
- `hooks/useAdminCategories.ts` - Lógica de negócio para CRUD administrativo

### Scripts de Banco
- `lib/database-migration-admin-categories.sql` - Migração completa

---

## 🔧 Componentes Principais

### 1. AdminCategoriesList
**Responsabilidade**: Interface principal de listagem e gerenciamento

**Funcionalidades**:
- Listagem em grid responsivo
- Estatísticas (total de categorias)
- Modais informativos
- Estados de carregamento
- Estado vazio com CTA

**Props**: Nenhuma (utiliza hook interno)

### 2. AdminCategoryCard  
**Responsabilidade**: Exibição individual de categoria com ações

**Funcionalidades**:
- Badge "Padrão" destacado
- Informações de escopo (Global/Todos usuários)
- Menu de ações (Editar/Excluir)
- Hover effects e animações

**Props**:
```typescript
interface AdminCategoryCardProps {
  category: Category
  onEdit: () => void
  onDelete: () => void
}
```

### 3. AdminCategoryForm
**Responsabilidade**: Formulário de criação/edição de categorias padrão

**Funcionalidades**:
- Preview em tempo real
- Paleta de cores administrativa (16 cores)
- Seleção de ícones (24 populares + busca)
- Validações com react-hook-form
- Alertas informativos

**Props**:
```typescript
interface AdminCategoryFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CategoryFormData) => Promise<void>
  category?: Category | null
  loading?: boolean
}
```

---

## 🎣 Hook useAdminCategories

### Responsabilidades
- Buscar apenas categorias padrão (`is_default = true`)
- CRUD completo com validações administrativas
- Gerenciamento de estados (loading, error, success)
- Verificação de uso antes de exclusão

### API
```typescript
interface UseAdminCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string
  success: string
  createCategory: (data: CategoryFormData) => Promise<void>
  updateCategory: (id: string, data: CategoryFormData) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  clearMessages: () => void
}
```

### Lógica de Segurança
```typescript
// Verificação antes de excluir
const { data: transactions } = await supabase
  .from('transactions')
  .select('id')
  .eq('category_id', id)
  .limit(1)

if (transactions && transactions.length > 0) {
  throw new Error('Categoria em uso em transações')
}
```

---

## 🔒 Segurança e Validações

### Proteções de Dados
1. **RLS Policies**: Controle de acesso baseado em usuário
2. **Triggers de Consistência**: Garantem `user_id = NULL` para padrão
3. **Validações de Exclusão**: Verificam uso em transações
4. **Confirmações Administrativas**: Alertas específicos para ações críticas

### Validações de Formulário
```typescript
const categorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
})
```

---

## 🎨 Interface e UX

### Design System Administrativo
- **Cores**: Paleta de 16 cores específicas para categorias
- **Ícones**: 24 ícones populares + busca completa
- **Badges**: Identificação visual de categorias padrão
- **Alertas**: Informativos sobre impacto das ações

### Responsividade
- **Mobile**: Tabs scrolláveis, cards adaptáveis
- **Desktop**: Layout otimizado com sidebar
- **Acessibilidade**: ARIA labels, navegação por teclado

### Estados da Interface
- **Carregamento**: Skeletons e indicadores
- **Vazio**: CTA para primeira categoria
- **Erro**: Mensagens claras com ações
- **Sucesso**: Confirmações temporárias

---

## 🔄 Integração com Sistema Existente

### Modificações nos Componentes
1. **CategoryForm.tsx**: Detecta e impede edição de categorias padrão
2. **CategoryChip.tsx**: Adiciona ícone administrativo para identificação
3. **app/categories/page.tsx**: Mensagens específicas para categorias padrão

### Navegação
- Novo grupo "Sistema" no menu lateral
- Item "Configurações" com ícone `admin_panel_settings`
- Breadcrumbs e navegação de volta

---

## 📊 Categorias Padrão Incluídas

### Despesas (15 categorias)
1. **Alimentação** - `#FF9800` - `restaurant`
2. **Transporte** - `#2196F3` - `directions_car`
3. **Moradia** - `#4CAF50` - `home`
4. **Saúde** - `#F44336` - `local_hospital`
5. **Lazer** - `#9C27B0` - `sports_esports`
6. **Compras** - `#FF5722` - `shopping_cart`
7. **Educação** - `#795548` - `school`
8. **Trabalho** - `#607D8B` - `work`
9. **Beleza** - `#E91E63` - `face`
10. **Tecnologia** - `#3F51B5` - `computer`
11. **Pets** - `#8BC34A` - `pets`
12. **Viagem** - `#FFC107` - `flight`
13. **Cultura** - `#673AB7` - `theater_comedy`
14. **Esportes** - `#CDDC39` - `fitness_center`
15. **Combustível** - `#FF6F00` - `local_gas_station`

### Receitas (5 categorias)
1. **Salário** - `#4CAF50` - `payment`
2. **Freelance** - `#2196F3` - `person_outline`
3. **Vendas** - `#FF9800` - `sell`
4. **Investimentos** - `#009688` - `trending_up`
5. **Rendimentos** - `#009688` - `account_balance`

---

## 🧪 Testes e Validação

### Cenários de Teste
1. **CRUD Administrativo**: Criar, editar, excluir categorias padrão
2. **Proteções**: Tentar editar categoria padrão como usuário normal
3. **Responsividade**: Testar em diferentes tamanhos de tela
4. **Acessibilidade**: Navegação por teclado e screen readers
5. **Performance**: Carregamento com muitas categorias

### Checklist de Qualidade
- ✅ Validações de formulário funcionando
- ✅ Estados de carregamento adequados
- ✅ Mensagens de erro claras
- ✅ Responsividade em todos os breakpoints
- ✅ Acessibilidade (ARIA, teclado)
- ✅ Integração com sistema existente
- ✅ Políticas RLS funcionando

---

## 🚀 Deploy e Migração

### Passos para Produção
1. **Aplicar migração de banco**: `database-migration-admin-categories.sql`
2. **Verificar políticas RLS**: Testar acessos e permissões
3. **Deploy do código**: Incluir todos os novos componentes
4. **Teste de integração**: Validar funcionamento completo
5. **Monitoramento**: Acompanhar erros e performance

### Rollback
- Script de reversão das políticas RLS
- Backup das categorias existentes
- Plano de comunicação para usuários

---

## 📝 Manutenção e Evolução

### Extensibilidade
- Sistema preparado para novos tipos de configuração
- Estrutura de tabs permite adição de novas seções
- Hook pattern facilita criação de novos gerenciadores

### Monitoramento
- Logs de ações administrativas
- Métricas de uso das categorias padrão
- Performance das consultas RLS

### Suporte
- Documentação de troubleshooting
- Guias para usuários administradores
- Procedimentos de backup e restore 