
# Especificação Técnica: One-Page Builder (MAG Seguros)

## 1. Guia de Estilo Extraído (MAG)
Com base no manual de identidade visual:

### Paleta de Cores (Hex)
- **Azul Primário (Pantone 300 C):** `#0079C2` (Principal para branding e botões)
- **Azul Escuro (Pantone 7691 C):** `#006098` (Textos de destaque e headers)
- **Azul Claro (Process Cyan):** `#00A7E7` (Elementos de apoio e hover)
- **Cinza Corporativo (Pantone 7545 C):** `#415364` (Textos secundários e bordas)
- **Gradiente MAG:** `linear-gradient(45deg, #00A7E7, #005F97)`
- **Semântica (Indicadores):**
  - Bom (Verde): `#10B981` (Adaptado para harmonia com o azul)
  - Alerta (Amarelo): `#F59E0B`
  - Crítico (Vermelho): `#EF4444`

### Tipografia
- **Digital/Web:** `Titillium Web` (Google Fonts) para interfaces de sistema.
- **Hierarquia:**
  - H1: 24px Bold (Títulos de Report)
  - H2: 18px Medium (Seções de Grid)
  - Body: 14px Regular (Dados e Insights)

---

## 2. Proposta de Arquitetura Técnica
- **Frontend:** React 18+ com TypeScript para segurança de tipos nos dados do report.
- **Styling:** Tailwind CSS para implementação rápida do Design System.
- **Gerenciamento de Estado:** React Context API para sincronizar o Formulário (Input) com o Preview em tempo real.
- **Exportação:** `html2canvas` + `jsPDF` para gerar o PDF A4 preservando as proporções do Grid CSS.
- **Abstração:** Camada de componentes "Headless" onde o layout é rígido, mas o conteúdo é dinâmico.

---

## 3. Especificação dos Templates (CSS Grid)
Todos os templates usam um container `aspect-[1/1.414]` (Proporção A4) ou `aspect-video` (16:9).

### Template A (Executivo C-Level)
- `grid-template-rows: auto 1fr 2fr;`
- Topo: Header com Logo MAG e título.
- Meio: 4 colunas (`grid-cols-4`) para componentes `KPI_Card`.
- Base: Área única para `Insight_Box` (Análise Qualitativa).

### Template B (Monitoramento de Funil - RH)
- `grid-template-rows: auto 1fr;`
- Topo: Header.
- Corpo: Fluxo horizontal (`flex`) com setas de conexão, cada estágio contendo um mini-grid de KPIs.

### Template C (Status de Projeto)
- `grid-template-rows: auto auto 1fr;`
- Topo: Header + `Status_Badge` global.
- Meio: Timeline horizontal simplificada.
- Base: `grid-cols-2` dividindo "Impedimentos" e "Próximos Passos".

---

## 4. Fluxo do Usuário (User Journey)
1. **Seleção de Estrutura:** O usuário escolhe um dos 3 templates rígidos (não há tela em branco).
2. **Preenchimento Orientado:** O formulário lateral abre campos específicos para o template escolhido (ex: se Template A, pede 4 valores de KPI e 1 campo de texto).
3. **Curadoria em Tempo Real:** O analista cola os dados. O sistema calcula deltas e aplica formatação MAG automaticamente.
4. **Validação Visual:** O preview à esquerda mostra exatamente o que será impresso.
5. **Exportação One-Click:** Gera o PDF final.
