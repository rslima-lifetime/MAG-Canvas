# Documentação Técnica e Estratégica do MAG Canvas para Agentes de IA

Esta documentação serve como a base de conhecimento definitiva para que agentes inteligentes entendam, planejem e gerem conteúdo no formato exato consumido pelo MAG Canvas da MAG Seguros.

---

## 1. Visão Geral e Objetivo do Sistema

O **MAG Canvas** é uma plataforma avançada de visualização de dados, governança e comunicação estratégica (Data Storytelling) focada em People Analytics e métricas corporativas.

### Objetivos Principais:
* **Eliminar placeholders e templates estáticos**: Permitir que os dados guiem o layout dinamicamente.
* **Facilidade de Apresentação**: Alternar entre os modos de leitura analítica (Relatório) e apresentação executiva direto no navegador.
* **Interface Habilitada por JSON**: Toda a estrutura e dados de páginas, métricas, tabelas e layouts são expressos puramente em objetos JSON estruturados.

---

## 2. O Formato Master JSON (Schema Obrigatório)

Para que o agente gere um JSON válido capaz de ser injetado e renderizado instantaneamente pelo MAG Canvas, ele DEVE seguir o seguinte mapeamento rigoroso.

### Exemplo Estrutural Completo (Master Template)

```json
{
  "title": "Nome do Relatório Estratégico",
  "subtitle": "Subtítulo descritivo do período ou contexto",
  "layoutFormat": "REPORT", 
  "designSystem": "STANDARD",
  "cover": {
    "enabled": true,
    "topLabel": "Etiqueta Superior do Relatório",
    "title": "Título Principal da Capa",
    "subtitle": "Subtítulo Contextual da Capa",
    "author": "Diretoria Responsável",
    "department": "Área / Núcleo de Origem",
    "manager": "Gerência ou Gestor",
    "date": "Mês e Ano (ex: Maio 2026)",
    "theme": "BLUE",
    "alignment": "LEFT"
  },
  "pages": [
    {
      "id": "page-unique-id-1",
      "title": "Título da Página 1",
      "subtitle": "Contexto da página atual",
      "theme": "LIGHT",
      "paddingY": 5,
      "blocks": [
        {
          "id": "block-id-1",
          "type": "SECTION",
          "width": "FULL",
          "title": "Título da Seção",
          "config": {
            "showTitle": true,
            "showSubtitle": true,
            "subtitle": "Explicação rápida do bloco",
            "align": "LEFT",
            "icon": "BookOpen"
          }
        }
      ]
    }
  ]
}
```

### Tipos e Enums Globais
* `layoutFormat`: `"REPORT"` ou `"PRESENTATION"`
* `designSystem`: `"STANDARD"` ou `"FUTURE"`
* `theme`: `"LIGHT"` (fundo branco) ou `"BLUE"` (fundo azul institucional)
* `width` (Largura do Bloco): `"FULL"`, `"THREE_QUARTERS"`, `"TWO_THIRDS"`, `"HALF"`, `"THIRD"`, `"QUARTER"`

---

## 3. Catálogo e Dicionário de Componentes (Blocks)

Cada bloco possui a propriedade `"type"` obrigatória e um dicionário `"config"` específico para seus parâmetros visuais e de dados.

### 3.1 SECTION (Divisor de Seção)
* **Objetivo**: Segmentar visualmente a narrativa em novos tópicos/capítulos.
* **Uso**: No início da página ou para separar blocos distintos.
* **Config:**
  * `align`: `"LEFT"`, `"CENTER"` ou `"RIGHT"`
  * `icon`: Nome de ícone compatível com Lucide-React (ex: `"TrendingUp"`, `"Users"`, `"Target"`).

### 3.2 BIG_NUMBERS (Grade de KPIs)
* **Objetivo**: Mostrar de 1 a 6 indicadores-chave de forma limpa e paralela.
* **Config:**
  * `columns`: Número de colunas (ex: `3`, `4`, `6`).
  * `kpis`: Array de objetos:
    * `label`: Nome da métrica.
    * `current`: Valor numérico atual.
    * `prev`: Valor numérico anterior (para cálculo do Delta comparativo).
    * `format`: `"INTEGER"`, `"DECIMAL"`, `"PERCENT"`, `"CURRENCY"`.
    * `showDelta` (boolean): Exibir a porcentagem de variação.
    * `trendData`: String com valores separados por vírgula para o minigráfico (ex: `"100,120,90,150"`).

### 3.3 KPI (Solo KPI com Sub-métricas)
* **Objetivo**: Destacar uma única métrica com ênfase extrema (ex: NPS principal).
* **Config:** Igual ao Big Numbers, mas com suporte a `subMeasures`: Array de `{ "label": "...", "value": "..." }`.

### 3.4 GAUGE (Velocímetro de Atingimento)
* **Objetivo**: Comparar um valor instantâneo contra limites de sucesso ou falha.
* **Config:**
  * `value`: Valor atual.
  * `min`, `max`: Limites do arco.
  * `lowThreshold`, `highThreshold`: Gatilhos de cores para zonas Crítica/Atenção/Ótima.

### 3.5 TEXT_BOX (Narrativa Escrita)
* **Objetivo**: Adicionar contexto, comentários executivos e conclusões.
* **Config:**
  * `style`: `"PLAIN"`, `"INTRO"`, `"ATTENTION"`, `"INSIGHT"`, `"BULLETS"`, `"PAR_MODEL"`, `"OBJECTIVE"`, `"CONCLUSION"`.
  * `content`: Texto corrido (suporta quebras de linha `\n`).

### 3.6 TABLE (Tabelas Inteligentes / Matrizes)
* **Objetivo**: Detalhamento tabular rico com apoio visual.
* **Config:**
  * `data`: Dados no formato TSV (Tab-Separated Values). A primeira linha deve ser o cabeçalho. Quebras com `\n`.
  * `infographicMode`: `"NONE"`, `"SPARKBAR"`, `"HEATMAP"`, `"STATUS"`.
  * `columnFormats`: Array mapeando formatos das colunas (ex: `["TEXT", "CURRENCY", "PERCENT"]`).

### 3.7 CHART (Gráficos)
* **Objetivo**: Revelar tendências, distribuições e correlações.
* **Config:**
  * `type`: `"COLUMN"`, `"BAR"`, `"LINE"`, `"AREA"`, `"PIE"`, `"DOUGHNUT"`, `"FUNNEL"`.
  * `data`: Formato TSV (ex: `"Mês\tValor\nJan\t10\nFev\t15"`).
  * `showGoalLine` (boolean) e `goalValue` (number).

### 3.8 OUTROS COMPONENTES ESTRATÉGICOS
* **TIMELINE**: Eventos cronológicos sequenciais (`events: [{ year, title, description, icon }]`).
* **STEP_PROCESS**: Fluxos de funil e processos de contratação em etapas horizontais.
* **NINE_BOX**: Matriz 3x3 clássica de Desempenho vs Potencial para Talent Management.
* **PROJECT_STATUS / KANBAN**: Para acompanhamento visual ágil de projetos.

---

## 4. Regras Práticas de Storytelling para o Agente

1. **Use Comentários**: Insira sempre `"annotation": "Análise aqui..."` nas configurações dos blocos para enriquecer o Data Storytelling.
2. **Selecione a Largura Correta**: Não abuse de blocos `"FULL"`. Se for um indicador simples, utilize `"THIRD"` ou `"HALF"`.
