# 📘 Guia do Usuário - Sistema de Insights Personalizados

## 🎯 O que são Insights Personalizados?

Os **Insights Personalizados** são alertas automáticos criados por você para monitorar condições específicas dos seus dados financeiros. Diferente dos insights automáticos (que são gerados pelo sistema), os insights personalizados permitem que você defina suas próprias regras e receba notificações quando determinadas situações ocorrem.

### ✨ Principais Benefícios

- 🔔 **Alertas Personalizados**: Receba notificações baseadas nas suas necessidades específicas
- 📊 **Controle Total**: Defina suas próprias condições e limites
- 🎨 **Templates Prontos**: Use modelos pré-definidos ou crie do zero
- 📈 **Monitoramento Contínuo**: Acompanhe automaticamente suas métricas importantes
- 🔧 **Flexibilidade**: Ative, desative, edite ou duplique insights facilmente

---

## 🚀 Como Começar

### 1. Acessando o Sistema
1. Navegue para **Configurações** no menu principal
2. Clique na aba **"Insights Personalizados"**
3. Clique em **"Criar Insight Personalizado"**

### 2. Escolhendo um Tipo
Você tem duas opções:

#### 🎨 **Templates Pré-definidos** (Recomendado para iniciantes)
- **Gastos por Categoria Excederam Limite**: Alerta quando uma categoria específica ultrapassar um valor
- **Aumento Percentual de Gastos**: Notificação para aumentos significativos comparados ao mês anterior
- **Meta de Economia Não Atingida**: Alerta quando a economia ficar abaixo da meta definida
- **Transações Acima da Média**: Notificação para volume de transações muito acima do normal
- **Orçamento Personalizado Excedido**: Alerta para orçamentos próximos do limite

#### ⚡ **Fórmula Personalizada** (Para usuários avançados)
- Crie condições personalizadas usando campos e operadores específicos
- Maior flexibilidade para cenários únicos

---

## 🎨 Templates Disponíveis

### 📈 **Gastos por Categoria Excederam Limite**
**O que monitora**: Gastos em uma categoria específica  
**Quando dispara**: Quando o valor gasto na categoria ultrapassa o limite definido  
**Exemplo**: Alerta quando gastos com "Alimentação" excedem R$ 800,00

### 📊 **Aumento Percentual de Gastos**
**O que monitora**: Variação percentual dos gastos totais  
**Quando dispara**: Quando o aumento supera o percentual definido  
**Exemplo**: Alerta quando gastos aumentam mais de 20% comparado ao mês anterior

### 💰 **Meta de Economia Não Atingida**
**O que monitora**: Sua economia mensal (receitas - gastos)  
**Quando dispara**: Quando a economia fica abaixo da meta  
**Exemplo**: Alerta quando economia mensal fica abaixo de R$ 500,00

### 🔢 **Transações Acima da Média**
**O que monitora**: Número de transações mensais  
**Quando dispara**: Quando o volume de transações supera significativamente a média  
**Exemplo**: Alerta quando número de transações for 50% acima da média

### 📋 **Orçamento Personalizado Excedido**
**O que monitora**: Percentual de uso de um orçamento específico  
**Quando dispara**: Quando aproxima do limite definido  
**Exemplo**: Alerta quando atingir 90% do orçamento de entretenimento

---

## ⚡ Criando Fórmulas Personalizadas

### 📊 Campos Disponíveis
- `total_income`: Receita total do mês
- `total_expenses`: Gastos totais do mês  
- `balance`: Saldo (receitas - gastos)
- `monthly_savings`: Economia mensal
- `transaction_count`: Número de transações
- `expenses_change_percentage`: Variação percentual dos gastos
- `category_amount`: Valor gasto em categoria específica
- `budget_percentage`: Percentual usado de um orçamento

### 🔧 Operadores Suportados
- **Comparação**: `>`, `<`, `>=`, `<=`, `==`, `!=`
- **Lógicos**: `AND`, `OR`
- **Texto**: `contains`, `not_contains`

### 💡 Exemplos de Fórmulas
```
total_expenses > 2000 AND category_amount > 500
balance < 1000 OR monthly_savings < 200
expenses_change_percentage > 15
transaction_count >= 50
```

---

## 📱 Visualizando os Insights

### 🏠 **Na Página de Relatórios**
1. Acesse **Relatórios** no menu
2. Clique na aba **"Insights Personalizados"**
3. Veja todos os insights que foram disparados no período

#### 🎯 Recursos da Visualização:
- **Dashboard com Estatísticas**: Total criados, disparados, críticos, etc.
- **Filtros por Severidade**: Crítico, Atenção, Sucesso, Info
- **Chips de Status**: Resumo rápido por tipo de severidade
- **Cards Detalhados**: Informações completas de cada insight disparado
- **Links Diretos**: Botões para acessar áreas relacionadas (orçamentos, transações)

### ⚙️ **Na Página de Configurações**
1. Acesse **Configurações** no menu
2. Clique em **"Insights Personalizados"**
3. Gerencie todos os seus insights criados

#### 🛠️ Ações Disponíveis:
- **✏️ Editar**: Modificar condições e configurações
- **📋 Duplicar**: Criar cópia para variações
- **🗑️ Excluir**: Remover insights desnecessários
- **🔄 Ativar/Desativar**: Controlar quais insights estão ativos
- **👁️ Visualizar**: Ver detalhes completos

---

## 🎨 Personalizando seus Insights

### 📝 **Informações Básicas**
- **Nome**: Título claro e descritivo
- **Descrição**: Detalhes sobre o que o insight monitora
- **Severidade**: Critical, Warning, Success, Info

### 🎯 **Configurações Avançadas**
- **Ativo/Inativo**: Controle quando o insight deve funcionar
- **Condições**: Regras específicas que disparam o alerta
- **Fórmulas**: Lógica personalizada para casos complexos

### 🎪 **Dicas de Boas Práticas**
1. **Nomes Descritivos**: Use nomes que explicam claramente o propósito
2. **Severidade Apropriada**: Use "Critical" apenas para situações realmente importantes
3. **Teste Gradualmente**: Comece com poucos insights e adicione conforme necessário
4. **Revise Regularmente**: Ajuste limites conforme seus hábitos mudam
5. **Use Templates**: Aproveite os modelos prontos antes de criar fórmulas complexas

---

## 🔧 Gerenciamento e Manutenção

### 📊 **Monitoramento**
- Acesse regularmente a página de **Relatórios** para ver insights disparados
- Use os filtros para focar nos insights mais importantes
- Observe padrões e ajuste limites conforme necessário

### ⚙️ **Manutenção**
- **Revise Mensalmente**: Verifique se os limites ainda fazem sentido
- **Desative Temporariamente**: Use quando não precisar de certas notificações
- **Ajuste Severidades**: Mude a importância conforme suas prioridades
- **Limpe Insights Antigos**: Remova insights que não são mais relevantes

### 🚨 **Solução de Problemas**
- **Insight não disparando**: Verifique se está ativo e se as condições estão corretas
- **Muitos alertas**: Ajuste os limites ou desative temporariamente alguns insights
- **Fórmulas complexas**: Use templates como base e faça alterações graduais

---

## 💡 Casos de Uso Práticos

### 👨‍💼 **Para Controle Pessoal**
- Monitor de gastos com cartão de crédito
- Alerta de economia abaixo da meta
- Controle de gastos em categorias específicas (lazer, alimentação)

### 👪 **Para Orçamento Familiar**
- Alertas de orçamentos por categoria
- Monitoramento de gastos totais mensais
- Controle de número de transações

### 📈 **Para Metas Financeiras**
- Acompanhamento de economia para objetivos
- Monitoramento de reduções de gastos
- Alertas de desvios do planejamento

### 🎯 **Para Análise Avançada**
- Comparações percentuais entre períodos
- Monitoramento de padrões de gastos
- Alertas de variações significativas

---

## 🎉 Próximos Passos

1. **📚 Comece**: Crie seu primeiro insight usando um template
2. **🔄 Experimente**: Teste diferentes configurações e limites  
3. **📊 Monitore**: Acompanhe os resultados na página de relatórios
4. **⚙️ Ajuste**: Refine as condições conforme sua experiência
5. **🚀 Expanda**: Crie insights mais avançados conforme a necessidade

---

## 🆘 Suporte

Se você tiver dúvidas ou precisar de ajuda:
1. Consulte este guia novamente
2. Experimente os templates antes de criar fórmulas personalizadas
3. Use a funcionalidade de "Duplicar" para testar variações
4. Comece com insights simples e evolua gradualmente

**Lembre-se**: Os insights personalizados são uma ferramenta poderosa para manter você no controle das suas finanças. Use-os de forma inteligente e eles se tornarão seus melhores aliados financeiros! 💪✨ 