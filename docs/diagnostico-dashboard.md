# Diagnóstico do Dashboard

## Itens priorizados

| Diagnóstico | Problema identificado | Tarefas sugeridas |
| ----------- | --------------------- | ----------------- |
| Oscilações fora do ideal | Variação brusca da temperatura média de 7 dias, indicando calibração inadequada de sensores. | 1. Ajustar limites de suavização. 2. Revisar rotinas de manutenção dos sensores críticos. |
| Tendência de umidade ascendente | Média móvel de umidade cresce mesmo com correção de ruído, sinalizando infiltração em silos. | 1. Realizar inspeção física dos silos afetados. 2. Instalar alertas preventivos para aumento de umidade. |
| Queda na qualidade do ar | AQI médio mantém-se acima do limiar aceitável, impactando a preservação dos grãos. | 1. Avaliar funcionamento dos sistemas de ventilação. 2. Integrar alarmes automáticos ao fluxo de manutenção. |

---

## Detalhamento dos diagnósticos

### Oscilações fora do ideal
- **Sintoma:** A temperatura média semanal apresenta picos frequentes acima do intervalo esperado.
- **Impacto:** Pode acelerar a deterioração dos grãos e provocar alertas falsos em cadeia.
- **Tarefas sugeridas:**
  1. Revisar os parâmetros de suavização da simulação no frontend e ajustar limites de ruído.
  2. Enfileirar chamado de manutenção para calibrar sensores que registraram as maiores variações.

### Tendência de umidade ascendente
- **Sintoma:** A curva de umidade mantém tendência de crescimento, mesmo após redução manual do ruído na simulação.
- **Impacto:** Risco elevado de proliferação de fungos e perda de qualidade das cargas armazenadas.
- **Tarefas sugeridas:**
  1. Programar inspeção física dos silos destacados e registrar observações no sistema de manutenção.
  2. Configurar alertas preventivos vinculados ao índice de umidade para acionar a equipe de campo com antecedência.

### Queda na qualidade do ar
- **Sintoma:** O índice AQI permanece alto por vários ciclos consecutivos, demonstrando ventilação deficiente.
- **Impacto:** Compromete a longevidade dos grãos e aumenta custos operacionais para reprocessamento.
- **Tarefas sugeridas:**
  1. Avaliar o estado dos exaustores e filtros, planejando substituição quando necessário.
  2. Automatizar notificações para integrar o time de manutenção e registrar ações corretivas no backlog.
