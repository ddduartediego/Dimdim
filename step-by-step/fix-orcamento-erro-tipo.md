# Fix: Erro ao Criar Orçamento - Conversão de Tipos

## Problema Identificado
- **Data**: Janeiro 2025
- **Descrição**: Erro "Expected number, received string" ao tentar criar orçamento
- **Causa**: O campo valor (amount) no formulário de orçamento estava enviando uma string em vez de number
- **Local**: `components/budgets/BudgetForm.tsx` - campo amount

## Detalhes Técnicos

### Erro Original
```
Expected number, received string
```

### Validação Zod
```typescript
// lib/validations.ts
export const budgetSchema = z.object({
  amount: z.number()
    .positive('Valor deve ser positivo')
    .max(999999.99, 'Valor muito alto'),
  // ...
})
```

### Problema no Formulário
O componente `TextField` com `type="number"` retorna uma string, mas o schema Zod esperava um number.

## Análise Comparativa

### ✅ Componentes que já estavam corretos
**TransactionFilters.tsx** - Campos valueFrom e valueTo:
```typescript
onChange={(e) => handleFilterChange('valueFrom', parseFloat(e.target.value) || undefined)}
```

### ❌ Componente com problema
**BudgetForm.tsx** - Campo amount:
```typescript
// ANTES (incorreto)
{...field}

// DEPOIS (correto)
{...field}
onChange={(e) => {
  const value = parseFloat(e.target.value) || 0;
  field.onChange(value);
}}
```

## Solução Implementada

### Alteração no BudgetForm.tsx
```typescript
<Controller
  name="amount"
  control={control}
  render={({ field }) => (
    <TextField
      {...field}
      onChange={(e) => {
        const value = parseFloat(e.target.value) || 0;
        field.onChange(value);
      }}
      label="Valor do orçamento"
      type="number"
      // ... outras props
    />
  )}
/>
```

### Como Funciona
1. Intercepta o evento `onChange` do TextField
2. Converte o valor string para number usando `parseFloat()`
3. Define 0 como valor padrão se a conversão falhar
4. Chama `field.onChange()` com o valor numérico

## Impacto da Correção

### Funcionalidade
- ✅ Criação de orçamentos agora funciona corretamente
- ✅ Validação Zod funciona conforme esperado
- ✅ Interface do usuário permanece inalterada
- ✅ Consistência com outros campos numéricos do sistema

### Escalabilidade
- Solução simples e direta
- Mantém a tipagem TypeScript correta
- Segue padrões do React Hook Form
- Padrão já utilizado em outros componentes

### Manutenibilidade
- Código claro e fácil de entender
- Não introduz dependências adicionais
- Reutilizável em outros campos numéricos
- Alinhado com arquitetura existente

## Testes Sugeridos

1. **Teste Básico**: Criar orçamento com valor válido (ex: 850.00)
2. **Teste de Validação**: Tentar criar com valor 0 ou negativo
3. **Teste de Limite**: Testar valor máximo (999999.99)
4. **Teste de Tipo**: Verificar se string vazia é tratada corretamente
5. **Teste de Integração**: Verificar se o orçamento aparece na lista após criação

## Arquivos Modificados
- `components/budgets/BudgetForm.tsx` - Correção do campo amount

## Padrão Recomendado

Para futuros campos numéricos em formulários React Hook Form + Zod:

```typescript
// ✅ CORRETO
<Controller
  name="numericalField"
  control={control}
  render={({ field }) => (
    <TextField
      {...field}
      onChange={(e) => {
        const value = parseFloat(e.target.value) || 0;
        field.onChange(value);
      }}
      type="number"
      // ... outras props
    />
  )}
/>

// ❌ INCORRETO
<Controller
  name="numericalField"
  control={control}
  render={({ field }) => (
    <TextField
      {...field}
      type="number"
      // ... outras props
    />
  )}
/>
```

## Possíveis Melhorias Futuras

1. **Validação Client-Side**: Adicionar validação em tempo real
2. **Formatação**: Melhorar formatação de moeda no campo
3. **Mensagens de Erro**: Personalizar mensagens de validação
4. **Acessibilidade**: Melhorar suporte a leitores de tela
5. **Hook Personalizado**: Criar hook para campos numéricos

## Conclusão
O problema foi resolvido de forma eficiente, garantindo que o campo amount sempre envie um valor numérico para a validação Zod. A solução é robusta, mantém a experiência do usuário intacta e segue os padrões já estabelecidos em outros componentes do sistema. Este fix também garante consistência na aplicação, eliminando discrepâncias entre diferentes formulários que utilizam campos numéricos. 