
import { ReportData } from '../types';

export interface TemplateMeta {
  id: string;
  title: string;
  description: string;
  tags: string[];
  data: ReportData;
}

// Helper para datas dinâmicas no template
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

const dayAfter = new Date(today);
dayAfter.setDate(today.getDate() + 3);
const dayAfterStr = dayAfter.toISOString().split('T')[0];

const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const nextWeekStr = nextWeek.toISOString().split('T')[0];

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'demo-guide',
    title: 'Guia de Componentes (Demo)',
    description: 'Aprenda a contar histórias com dados. Este template demonstra como e quando usar cada componente visual do MAG Canvas (Gráficos, KPIs, Tabelas, etc).',
    tags: ['Tutorial', 'Design', 'Storytelling', 'Didático'],
    data: {
  "title": "Guia Visual de Componentes",
  "subtitle": "Boas práticas de uso do MAG Canvas",
  "layoutFormat": "REPORT",
  "designSystem": "STANDARD",
  "pages": [
    {
      "id": "demo-page-1",
      "title": "Fundamentos da Página",
      "subtitle": "Estruturando sua narrativa com Seções e Métricas Chave",
      "theme": "LIGHT",
      "blocks": [
        {
          "id": "demo-sec-1",
          "type": "SECTION",
          "width": "FULL",
          "title": "Use este componente para criar um título atraente",
          "config": {
            "showTitle": true,
            "showSubtitle": true,
            "subtitle": "Este componente é ideal para marcar o início de uma nova história ou capítulo dentro do seu relatório.",
            "align": "LEFT",
            "icon": "BookOpen"
          }
        },
        {
          "id": "demo-txt-1",
          "type": "TEXT_BOX",
          "width": "FULL",
          "title": "A importância da Narrativa",
          "config": {
            "style": "INTRO",
            "content": "Dados sem contexto são apenas números. Utilize o componente de Texto para explicar o 'porquê' por trás dos dados. Este bloco usa o estilo 'Contexto', mas você pode alterá-lo para 'Alerta', 'Insight' ou 'Objetivo' no menu lateral para destacar informações críticas."
          }
        },
        {
          "id": "demo-sec-2",
          "type": "SECTION",
          "width": "FULL",
          "title": "Indicadores de Grande Impacto (Big Numbers)",
          "config": {
            "showTitle": true,
            "align": "LEFT",
            "icon": "Target",
            "showSubtitle": true,
            "subtitle": "Use para as métricas mais importantes que o executivo deve ler primeiro."
          }
        },
        {
          "id": "demo-kpi-1",
          "type": "BIG_NUMBERS",
          "width": "FULL",
          "title": "",
          "config": {
            "columns": 4,
            "kpis": [
              {
                "label": "Métrica Principal",
                "current": 1250,
                "prev": 1100,
                "format": "INTEGER",
                "showDelta": true,
                "showTrend": true,
                "trendData": "1000, 1050, 1100, 1150, 1250"
              },
              {
                "label": "Atingimento da Meta",
                "current": 85,
                "prev": 80,
                "format": "PERCENT",
                "showDelta": true,
                "showGoal": true,
                "goal": 90
              },
              {
                "label": "Volume Financeiro",
                "current": 450000,
                "prev": 420000,
                "format": "CURRENCY",
                "abbreviate": true,
                "showDelta": true,
                "showTrend": false
              },
              {
                "label": "Headcount",
                "current": 342,
                "prev": 345,
                "format": "INTEGER",
                "showDelta": true,
                "showGoal": false,
                "trendData": "330, 335, 340, 345, 342"
              }
            ]
          }
        },
        {
          "id": "demo-txt-2",
          "type": "TEXT_BOX",
          "width": "FULL",
          "title": "",
          "config": {
            "style": "INSIGHT",
            "content": "Dica: No componente acima, você pode ligar/desligar a barra de meta individualmente para cada indicador."
          }
        },
        {
          "id": "demo-solo-sec",
          "type": "SECTION",
          "width": "FULL",
          "title": "Destaque Individual (Solo KPI)",
          "config": {
            "showTitle": true,
            "align": "LEFT",
            "icon": "Target",
            "subtitle": "Use este componente para dar ênfase total a uma métrica crítica ('North Star Metric')."
          }
        },
        {
          "id": "demo-solo-1",
          "type": "KPI",
          "width": "THIRD",
          "title": "",
          "config": {
            "label": "NPS Relacional",
            "current": 76,
            "prev": 68,
            "goal": 75,
            "format": "INTEGER",
            "showDelta": true,
            "showGoal": true,
            "showTrend": true,
            "trendData": "60, 65, 62, 70, 76",
            "subMeasures": [
              {
                "label": "Promotores",
                "value": "80%"
              },
              {
                "label": "Detratores",
                "value": "5%"
              }
            ]
          }
        },
        {
          "id": "demo-solo-txt",
          "type": "TEXT_BOX",
          "width": "TWO_THIRDS",
          "title": "Anatomia do Solo KPI",
          "config": {
            "style": "BULLETS",
            "content": "Diferente do 'Big Numbers' (que é uma grade), o Solo KPI permite detalhar um único indicador com:\n• Gráfico de tendência (Sparkline)\n• Barra de progresso da meta\n• Sub-métricas para contexto adicional"
          }
        }
      ],
      "paddingY": 5
    },
    {
      "id": "demo-page-2",
      "title": "Storytelling com Gráficos",
      "subtitle": "Transformando números em narrativas visuais",
      "theme": "LIGHT",
      "blocks": [
        {
          "id": "demo-chart-guide",
          "type": "INFOGRAPHIC_LIST",
          "width": "FULL",
          "title": "Guia Rápido: Qual gráfico usar?",
          "config": {
            "layout": "GRID",
            "items": [
              {
                "id": "g1",
                "title": "Tendência (Linhas/Área)",
                "description": "Ideal para mostrar evolução temporal. Ex: Headcount mensal ou Turnver anual.",
                "icon": "TrendingUp",
                "tag": "Temporal",
                "tagColor": "#e0f2fe",
                "itemWidth": "33"
              },
              {
                "id": "g2",
                "title": "Comparação (Barras)",
                "description": "Melhor para rankings e categorias. Ex: Absenteísmo por Diretoria.",
                "icon": "BarChart3",
                "tag": "Ranking",
                "tagColor": "#fef9c3",
                "itemWidth": "33"
              },
              {
                "id": "g3",
                "title": "Composição (Pizza/Rosca)",
                "description": "Use para mostrar partes de um todo estático. Ex: Headcount por Gênero.",
                "icon": "PieChart",
                "tag": "Distribuição",
                "tagColor": "#dcfce7",
                "itemWidth": "33"
              }
            ]
          }
        },
        {
          "id": "demo-trend-sec",
          "type": "SECTION",
          "width": "FULL",
          "title": "Evolução Temporal",
          "config": {
            "showTitle": true,
            "icon": "TrendingUp"
          }
        },
        {
          "id": "demo-chart-1",
          "type": "CHART",
          "width": "HALF",
          "title": "Histórico de Receita",
          "config": {
            "type": "AREA",
            "showXAxis": true,
            "showLegend": true,
            "showLabels": true,
            "annotation": "A estabilização da curva no Q2 reflete a maturidade do novo produto.",
            "data": "Mês\tRealizado\tMeta\nJan\t80\t100\nFev\t95\t100\nMar\t110\t100\nAbr\t105\t100"
          }
        },
        {
          "id": "demo-chart-text-1",
          "type": "TEXT_BOX",
          "width": "HALF",
          "title": "Sobre o Gráfico de Área",
          "config": {
            "style": "INSIGHT",
            "content": "Gráficos de Área são excelentes para dar noção de volume acumulado. Note a caixa de comentário abaixo do gráfico (Insight Estratégico). Use este recurso para explicar anomalias ou tendências que não são óbvias apenas olhando os números."
          }
        },
        {
          "id": "demo-rank-sec",
          "type": "SECTION",
          "width": "FULL",
          "title": "Comparação de Categorias",
          "config": {
            "showTitle": true,
            "icon": "BarChart3"
          }
        },
        {
          "id": "demo-chart-2",
          "type": "CHART",
          "width": "HALF",
          "title": "Headcount por Diretoria",
          "config": {
            "type": "BAR",
            "showXAxis": true,
            "showLegend": false,
            "showLabels": true,
            "annotation": "O crescimento da área Comercial (+15%) foi planejado no budget.",
            "data": "Categoria\tValor\nComercial\t450\nOperações\t320\nTecnologia\t280\nRH\t150"
          }
        },
        {
          "id": "demo-chart-text-2",
          "type": "TEXT_BOX",
          "width": "HALF",
          "title": "Sobre o Gráfico de Barras",
          "config": {
            "style": "INTRO",
            "content": "Para rankings, prefira barras horizontais. Elas facilitam a leitura dos rótulos e a comparação visual do comprimento. Evite gráficos de pizza para comparar mais de 3 categorias, pois o cérebro humano tem dificuldade em comparar ângulos."
          }
        }
      ],
      "paddingY": 5
    },
    {
      "id": "demo-page-3",
      "title": "Precisão",
      "subtitle": "Detalhamento e Composições",
      "theme": "LIGHT",
      "blocks": [
        {
          "id": "demo-table-sec",
          "type": "SECTION",
          "width": "FULL",
          "title": "Tabelas e Data Grids",
          "config": {
            "showTitle": true,
            "subtitle": "Use tabelas quando a precisão do número exato for necessária.",
            "icon": "Table"
          }
        },
        {
          "id": "demo-table-txt",
          "type": "TEXT_BOX",
          "width": "FULL",
          "title": "",
          "config": {
            "style": "INTRO",
            "content": "Tabelas com muitos números podem ser difíceis de ler. Use os recursos visuais 'Heatmap' e 'Status' para guiar o olho do leitor para o que importa (os outliers)."
          }
        },
        {
          "id": "demo-table-1",
          "type": "TABLE",
          "width": "FULL",
          "title": "Matriz com Heatmap e Status",
          "config": {
            "data": "Departamento\tHC\tTurnover %\tEngajamento\tCusto Médio\nVendas\t120\t2.5%\t100\tR$ 4.500\nTI\t80\t1.2%\t40\tR$ 8.200\nAtendimento\t200\t3.8%\t60\tR$ 2.800\nMarketing\t45\t1.5%\t90\tR$ 5.100",
            "density": "NORMAL",
            "targetColumns": [
              3
            ],
            "infographicMode": "HEATMAP",
            "columnFormats": [
              "TEXT",
              "INTEGER",
              "PERCENT",
              "TEXT",
              "CURRENCY"
            ],
            "lastRowIsTotal": false,
            "columnWidths": [
              20,
              20,
              20,
              20,
              20
            ]
          }
        },
        {
          "id": "demo-fin-sec",
          "type": "SECTION",
          "width": "FULL",
          "title": "Demonstrativos Financeiros",
          "config": {
            "showTitle": true,
            "icon": "DollarSign"
          }
        },
        {
          "id": "demo-table-finance",
          "type": "TABLE",
          "width": "TWO_THIRDS",
          "title": "Budget por Centro de Custo",
          "config": {
            "data": "CC\tBudget (Anual)\tRealizado (YTD)\tVar %\nMarketing\t1200000\t850000\t-12\nTecnologia\t3500000\t3400000\t-2\nRH\t800000\t750000\t-6\nOps\t2100000\t2200000\t4.5\nTotal\t7600000\t7200000\t-5.2",
            "density": "NORMAL",
            "targetColumns": [
              4
            ],
            "columnGoals": [
              0,
              0,
              0,
              0,
              0
            ],
            "infographicMode": "STATUS",
            "columnFormats": [
              "TEXT",
              "CURRENCY",
              "CURRENCY",
              "PERCENT"
            ],
            "columnPrecisions": [
              0,
              0,
              0,
              1
            ],
            "lastRowIsTotal": true
          }
        },
        {
          "id": "demo-fin-pie",
          "type": "CHART",
          "width": "THIRD",
          "title": "Share de Custo",
          "config": {
            "type": "DOUGHNUT",
            "data": "Área\tValor\nMarketing\t12\nTecnologia\t45\nRH\t8\nOps\t35",
            "showLabels": true,
            "labelContent": "PERCENT",
            "showLegend": false
          }
        },
        {
          "id": "demo-fin-txt",
          "type": "TEXT_BOX",
          "width": "FULL",
          "title": "",
          "config": {
            "style": "INSIGHT",
            "content": "Dica: Ative a opção 'Última linha como Total' no editor de tabela para destacar automaticamente a linha de consolidação (como visto acima)."
          }
        }
      ],
      "paddingY": 5
    },
    {
      "id": "demo-page-gauge-focus",
      "title": "Monitoramento de Metas",
      "subtitle": "Visualização de Atingimento e Performance",
      "theme": "LIGHT",
      "blocks": [
        {
          "id": "demo-comp-sec",
          "type": "SECTION",
          "width": "FULL",
          "title": "Opção 1: Velocímetro (Gauge)",
          "config": {
            "showTitle": true,
            "icon": "Timer"
          }
        },
        {
          "id": "demo-gauge-1",
          "type": "GAUGE",
          "width": "HALF",
          "title": "Aderência ao Orçamento",
          "config": {
            "value": 98.5,
            "min": 80,
            "max": 110,
            "lowThreshold": 90,
            "highThreshold": 100,
            "format": "PERCENT"
          }
        },
        {
          "id": "demo-txt-gauge",
          "type": "TEXT_BOX",
          "width": "HALF",
          "title": "Foco Único",
          "config": {
            "style": "BULLETS",
            "content": "O Velocímetro é perfeito para responder a uma única pergunta binária: 'Estamos na meta?'.\nUse as cores invertidas para métricas onde 'Menor é Melhor' (ex: Turnover)."
          }
        },
        {
          "id": "demo-meta-others-sec",
          "type": "SECTION",
          "width": "FULL",
          "title": "Opção 2: KPIs com Barra de Progresso",
          "config": {
            "showTitle": true,
            "icon": "Target"
          }
        },
        {
          "id": "demo-meta-grid",
          "type": "BIG_NUMBERS",
          "width": "FULL",
          "title": "Painel de Metas Corporativas",
          "config": {
            "columns": 3,
            "kpis": [
              {
                "label": "Faturamento (YTD)",
                "current": 14.5,
                "goal": 15,
                "format": "CURRENCY",
                "abbreviate": true,
                "showDelta": false,
                "showTrend": false,
                "showGoal": true
              },
              {
                "label": "CSAT (Satisfação)",
                "current": 92,
                "goal": 90,
                "format": "PERCENT",
                "showDelta": false,
                "showTrend": false,
                "showGoal": true
              },
              {
                "label": "Treinamentos",
                "current": 450,
                "goal": 600,
                "format": "INTEGER",
                "showDelta": false,
                "showTrend": false,
                "showGoal": true
              }
            ]
          }
        },
        {
          "id": "demo-meta-chart-sec",
          "type": "SECTION",
          "width": "FULL",
          "title": "Opção 3: Gráfico com Linha de Meta",
          "config": {
            "showTitle": true,
            "icon": "BarChart3"
          }
        },
        {
          "id": "demo-meta-chart",
          "type": "CHART",
          "width": "HALF",
          "title": "Vendas por Regional vs Meta",
          "config": {
            "type": "COLUMN",
            "data": "Regional\tVendas\nNorte\t120\nSul\t95\nLeste\t110\nOeste\t85",
            "showGoalLine": true,
            "goalValue": 100,
            "showLabels": true
          }
        },
        {
          "id": "demo-meta-txt-3",
          "type": "TEXT_BOX",
          "width": "HALF",
          "title": "Comparação Visual",
          "config": {
            "style": "INSIGHT",
            "content": "Gráficos de barra com linha de meta (Goal Line) são excelentes para comparar múltiplos itens contra um mesmo alvo padrão. Acima, vemos quais regionais superaram a meta de 100."
          }
        }
      ],
      "paddingY": 5
    },
    {
      "id": "demo-page-4",
      "title": "Frameworks Estratégicos",
      "subtitle": "Ferramentas visuais para análise qualitativa e planejamento",
      "theme": "LIGHT",
      "blocks": [
        {
          "id": "demo-timeline-sec",
          "type": "SECTION",
          "width": "FULL",
          "title": "Linha do Tempo e Projetos",
          "config": {
            "showTitle": true,
            "icon": "History"
          }
        },
        {
          "id": "demo-timeline-1",
          "type": "TIMELINE",
          "width": "FULL",
          "title": "",
          "config": {
            "events": [
              {
                "year": "Q1",
                "title": "Planejamento",
                "description": "Definição de escopo e budget.",
                "icon": "map-pin",
                "color": "#0079C2"
              },
              {
                "year": "Q2",
                "title": "Desenvolvimento",
                "description": "Execução das frentes prioritárias.",
                "icon": "code",
                "color": "#00A7E7"
              },
              {
                "year": "Q3",
                "title": "Testes & Go-Live",
                "description": "Validação e lançamento oficial.",
                "icon": "rocket",
                "color": "#10B981"
              }
            ]
          }
        },
        {
          "id": "demo-process-sec",
          "type": "SECTION",
          "width": "FULL",
          "title": "Fluxos e Processos",
          "config": {
            "showTitle": true,
            "icon": "GitCommitHorizontal"
          }
        },
        {
          "id": "demo-process-1",
          "type": "STEP_PROCESS",
          "width": "FULL",
          "title": "Funil de Recrutamento",
          "config": {
            "steps": [
              {
                "label": "Inscritos",
                "value": "500",
                "status": "INFO"
              },
              {
                "label": "Triagem",
                "value": "150",
                "status": "NONE"
              },
              {
                "label": "Entrevista",
                "value": "45",
                "status": "WARNING"
              },
              {
                "label": "Contratados",
                "value": "12",
                "status": "SUCCESS"
              }
            ]
          }
        },
        {
          "id": "demo-infographic-sec",
          "type": "SECTION",
          "width": "FULL",
          "title": "Listas Infográficas",
          "config": {
            "showTitle": true,
            "icon": "LayoutList"
          }
        },
        {
          "id": "demo-info-1",
          "type": "INFOGRAPHIC_LIST",
          "width": "FULL",
          "title": "",
          "config": {
            "layout": "GRID",
            "items": [
              {
                "id": "1",
                "title": "Pilar de Cultura",
                "description": "Fortalecimento dos valores institucionais através de workshops.",
                "icon": "Users",
                "tag": "Prioridade",
                "tagColor": "#dcfce7",
                "itemWidth": "33"
              },
              {
                "id": "2",
                "title": "Inovação",
                "description": "Adoção de IA para otimização de processos internos.",
                "icon": "Zap",
                "tag": "Novo",
                "tagColor": "#e0f2fe",
                "itemWidth": "33"
              },
              {
                "id": "3",
                "title": "Eficiência",
                "description": "Revisão de contratos e redução de custos operacionais.",
                "icon": "TrendingUp",
                "tag": "Em Andamento",
                "tagColor": "#fef9c3",
                "itemWidth": "33"
              }
            ]
          }
        }
      ],
      "paddingY": 5
    },
    {
      "id": "demo-page-5",
      "title": "Gestão de Projetos",
      "subtitle": "Acompanhamento tático e cronograma",
      "theme": "LIGHT",
      "blocks": [
        {
          "id": "demo-cal-sec",
          "type": "SECTION",
          "width": "FULL",
          "title": "Gestão de Projetos (Calendário)",
          "config": {
            "showTitle": true,
            "icon": "Calendar"
          }
        },
        {
          "id": "demo-cal-txt",
          "type": "TEXT_BOX",
          "width": "FULL",
          "title": "Acompanhamento Tático",
          "config": {
            "style": "INTRO",
            "content": "Para reportar o andamento de iniciativas, use o componente Calendário. Ele possui modos de visualização Mensal, Semanal e Lista (Agenda). O modo Lista é o mais recomendado para relatórios impressos."
          }
        },
        {
          "id": "demo-cal-1",
          "type": "PROJECT_CALENDAR",
          "width": "FULL",
          "title": "",
          "config": {
            "viewMode": "LIST",
            "currentMonth": "2026-01-21T20:10:06.639Z",
            "showLegend": true,
            "showPriorityTags": true,
            "daysData": {
              "2026-01-20": {
                "date": "2026-01-20",
                "projects": [
                  {
                    "id": "p0",
                    "title": "Kick-off Meeting",
                    "status": "COMPLETED",
                    "priority": "HIGH",
                    "description": "Alinhamento inicial com stakeholders."
                  }
                ]
              },
              "2026-01-21": {
                "date": "2026-01-21",
                "projects": [
                  {
                    "id": "p1",
                    "title": "Entrega da Fase 1",
                    "status": "COMPLETED",
                    "priority": "HIGH",
                    "description": "Módulo de cadastro finalizado e testado."
                  },
                  {
                    "id": "p2",
                    "title": "Homologação",
                    "status": "IN_PROGRESS",
                    "priority": "MEDIUM"
                  }
                ]
              },
              "2026-01-22": {
                "date": "2026-01-22",
                "projects": [
                  {
                    "id": "p4",
                    "title": "Workshop de Design",
                    "status": "NOT_STARTED",
                    "priority": "MEDIUM",
                    "description": "Dinâmica de co-criação com o time de UX."
                  }
                ]
              },
              "2026-01-24": {
                "date": "2026-01-24",
                "projects": [
                  {
                    "id": "p5",
                    "title": "Revisão de Qualidade",
                    "status": "NOT_STARTED",
                    "priority": "LOW"
                  }
                ]
              },
              "2026-01-28": {
                "date": "2026-01-28",
                "projects": [
                  {
                    "id": "p3",
                    "title": "Go-Live Piloto",
                    "status": "NOT_STARTED",
                    "priority": "HIGH",
                    "description": "Aguardando aprovação final da segurança."
                  }
                ]
              }
            }
          }
        }
      ],
      "paddingY": 5
    },
    {
      "id": "demo-page-6",
      "title": "Boas Práticas e Encerramento",
      "subtitle": "Checklist final para garantir a qualidade do seu report",
      "theme": "LIGHT",
      "blocks": [
        {
          "id": "final-sec-1",
          "type": "SECTION",
          "width": "FULL",
          "title": "Pilares do Report Perfeito",
          "config": {
            "showTitle": true,
            "icon": "Award"
          }
        },
        {
          "id": "final-info-1",
          "type": "INFOGRAPHIC_LIST",
          "width": "FULL",
          "title": "",
          "config": {
            "layout": "FEATURE",
            "items": [
              {
                "id": "f1",
                "title": "Hierarquia Visual",
                "description": "O olho deve ser guiado do mais importante (Big Numbers) para o detalhe (Tabelas).",
                "icon": "Layout",
                "itemWidth": "100",
                "color": "#0079C2"
              },
              {
                "id": "f2",
                "title": "Narrativa Clara",
                "description": "Dados sem contexto geram dúvidas. Use os blocos de texto para explicar o 'porquê'.",
                "icon": "MessageSquare",
                "itemWidth": "50",
                "color": "#00A7E7"
              },
              {
                "id": "f3",
                "title": "Integridade",
                "description": "Sempre valide a fonte dos dados e as fórmulas antes de exportar o PDF final.",
                "icon": "ShieldCheck",
                "itemWidth": "50",
                "color": "#10B981"
              }
            ]
          }
        },
        {
          "id": "final-sec-2",
          "type": "SECTION",
          "width": "FULL",
          "title": "Fluxo de Validação",
          "config": {
            "showTitle": true,
            "icon": "CheckCircle2"
          }
        },
        {
          "id": "final-step-1",
          "type": "STEP_PROCESS",
          "width": "FULL",
          "title": "Checklist de Publicação",
          "config": {
            "steps": [
              {
                "label": "Dados",
                "value": "1",
                "status": "SUCCESS",
                "subtext": "Conferência"
              },
              {
                "label": "Visual",
                "value": "2",
                "status": "WARNING",
                "subtext": "Alinhamento"
              },
              {
                "label": "Texto",
                "value": "3",
                "status": "NONE",
                "subtext": "Ortografia"
              },
              {
                "label": "Exportar",
                "value": "4",
                "status": "NONE",
                "subtext": "Gerar PDF"
              }
            ]
          }
        },
        {
          "id": "final-txt-1",
          "type": "TEXT_BOX",
          "width": "FULL",
          "title": "Dica Final",
          "config": {
            "style": "ATTENTION",
            "content": "Lembre-se: Menos é Mais. Evite poluição visual e mantenha o foco na mensagem principal que você deseja transmitir para a diretoria. Use o modo 'Apresentação' para revisar o fluxo antes de gerar o PDF."
          }
        }
      ],
      "paddingY": 5
    }
  ],
  "cover": {
    "enabled": true,
    "title": "Guia de Uso dos Componentes",
    "subtitle": "Manual Prático de Storytelling com Dados",
    "author": "Design System",
    "manager": "People Analytics",
    "department": "Tutorial Interativo",
    "date": "janeiro de 2026",
    "theme": "BLUE",
    "alignment": "LEFT"
  }
}
  },
  {
    id: 'comprehensive-qbr',
    title: 'Review Trimestral Completo (QBR)',
    description: 'Relatório denso e completo com 5 páginas. Ideal para fechamentos de trimestre, cobrindo Estratégia, Talentos, Cultura, Orçamento e Projetos.',
    tags: ['Completo', 'QBR', 'Diretoria', 'A4'],
    data: {
      title: "Quarterly Business Review - Q3 2024",
      subtitle: "Análise Integrada de Performance e Estratégia",
      layoutFormat: "REPORT",
      designSystem: "STANDARD",
      pages: [
        {
          id: "qbr-page-1",
          title: "Visão Executiva",
          subtitle: "Destaques macro do trimestre e indicadores globais",
          theme: "LIGHT",
          blocks: [
            {
              id: "qbr-b0-section",
              type: "SECTION",
              width: "FULL",
              title: "Contexto Macro",
              config: {
                showTitle: true,
                align: "LEFT",
                icon: "Flag"
              }
            },
            {
              id: "qbr-b0-text",
              type: "TEXT_BOX",
              width: "FULL",
              title: "",
              config: {
                style: "INTRO",
                content: "O encerramento do Q3 demonstra a resiliência da operação frente às oscilações de mercado. O foco em eficiência operacional (Projeto Lean) permitiu uma redução de custos sem impactar a entrega final.\n\nPriorizamos a estabilização do quadro de Tecnologia e a revisão da política de benefícios, preparando o terreno para o ciclo de avaliação de desempenho que se inicia no próximo mês."
              }
            },
            {
              id: "qbr-b1",
              type: "SECTION",
              width: "FULL",
              title: "Indicadores Globais",
              config: {
                showTitle: true,
                align: "LEFT",
                icon: "Target"
              }
            },
            {
              id: "qbr-b2",
              type: "BIG_NUMBERS",
              width: "FULL",
              title: "",
              config: {
                columns: 5,
                kpis: [
                  {
                    label: "Headcount Total",
                    current: 2450,
                    prev: 2380,
                    format: "INTEGER",
                    showDelta: true,
                    showTrend: true,
                    trendData: "2300, 2350, 2380, 2410, 2450"
                  },
                  {
                    label: "Receita / Colab",
                    current: 450000,
                    prev: 420000,
                    format: "CURRENCY",
                    abbreviate: true,
                    showDelta: true,
                    showGoal: true,
                    goal: 440000
                  },
                  {
                    label: "Turnover Geral",
                    current: 1.8,
                    prev: 2.1,
                    format: "PERCENT",
                    showDelta: true,
                    showTrend: true,
                    trendData: "2.5, 2.3, 2.1, 1.9, 1.8"
                  },
                  {
                    label: "eNPS",
                    current: 72,
                    prev: 68,
                    format: "INTEGER",
                    showDelta: true,
                    showGoal: true,
                    goal: 75
                  },
                  {
                    label: "Absenteísmo",
                    current: 2.4,
                    prev: 2.8,
                    format: "PERCENT",
                    showDelta: true,
                    showGoal: true,
                    goal: 2.5
                  }
                ]
              }
            },
            {
              id: "qbr-b3",
              type: "CHART",
              width: "HALF",
              title: "Evolução do Headcount",
              config: {
                type: "AREA",
                showXAxis: true,
                showLegend: true,
                showLabels: false,
                data: "Mês\tRealizado\tOrçado\nJan\t2300\t2300\nFev\t2320\t2310\nMar\t2350\t2320\nAbr\t2380\t2350\nMai\t2410\t2380\nJun\t2450\t2400"
              }
            },
            {
              id: "qbr-b5",
              type: "TEXT_BOX",
              width: "HALF",
              title: "Análise da Diretoria",
              config: {
                style: "INSIGHT",
                content: "O trimestre apresentou resultados sólidos, superando a meta de Receita por Colaborador devido à eficiência operacional implementada no Q2.\n\nO Turnover apresentou queda significativa após as ações de revisão de benefícios. Atenção para o leve desvio no orçamento de Headcount (+2%) devido à antecipação de vagas de Tecnologia."
              }
            },
            {
              id: "qbr-b-extra-1",
              type: "TABLE",
              width: "FULL",
              title: "Detalhamento por Unidade",
              config: {
                data: "Unidade\tHC\tTO %\tAbs %\teNPS\nSP Capital\t1200\t1.5\t2.1\t75\nRio de Janeiro\t800\t2.1\t2.8\t68\nNordeste\t300\t1.2\t1.5\t82\nSul\t150\t2.5\t3.0\t60",
                infographicMode: "STATUS",
                targetColumns: [
                  4
                ],
                columnGoals: [
                  0,
                  0,
                  0,
                  0,
                  75
                ],
                density: "COMPACT"
              }
            }
          ],
          paddingY: 9,
          rowGap: 20
        },
        {
          id: "qbr-page-2",
          title: "Aquisição de Talentos",
          subtitle: "Performance do funil de recrutamento e qualidade da contratação",
          theme: "LIGHT",
          blocks: [
            {
              id: "qbr-ta-intro",
              type: "SECTION",
              width: "FULL",
              title: "Estratégia de Atração",
              config: {
                showTitle: true,
                align: "LEFT",
                icon: "Target"
              }
            },
            {
              id: "qbr-ta-text",
              type: "TEXT_BOX",
              width: "FULL",
              title: "",
              config: {
                style: "INTRO",
                content: "O trimestre registrou um aumento de 15% no volume de contratações, impulsionado pela expansão regional da força de vendas. A taxa de aceitação de ofertas (Offer Acceptance Rate) subiu para 92% após a revisão da política de remuneração variável.\n\nO foco atual está na redução do SLA para vagas de tecnologia e na diversificação das fontes de aquisição para reduzir o custo médio por contratação (CPH)."
              }
            },
            {
              id: "qbr-ta-kpis",
              type: "BIG_NUMBERS",
              width: "FULL",
              title: "Métricas de Qualidade",
              config: {
                columns: 4,
                kpis: [
                  {
                    label: "Custo Médio (CPH)",
                    current: 1250,
                    prev: 1400,
                    format: "CURRENCY",
                    abbreviate: true,
                    showDelta: true,
                    showGoal: true,
                    goal: 1200
                  },
                  {
                    label: "NPS Candidato",
                    current: 78,
                    prev: 72,
                    format: "INTEGER",
                    showDelta: true,
                    showGoal: true,
                    goal: 75
                  },
                  {
                    label: "Turnover Precoce (<90d)",
                    current: 4.5,
                    prev: 6,
                    format: "PERCENT",
                    showDelta: true,
                    showGoal: true,
                    goal: 5,
                    abbreviate: true
                  },
                  {
                    label: "Diversidade (Gênero)",
                    current: 42,
                    prev: 38,
                    format: "PERCENT",
                    showDelta: true,
                    showGoal: true,
                    goal: 50,
                    subMeasures: [
                      {
                        label: "Meta 2025",
                        value: "50%"
                      }
                    ],
                    showSubMeasures: false
                  }
                ]
              }
            },
            {
              id: "qbr-b6",
              type: "SECTION",
              width: "FULL",
              title: "Funil de Conversão (YTD)",
              config: {
                showTitle: true,
                icon: "Filter"
              }
            },
            {
              id: "qbr-b7",
              type: "STEP_PROCESS",
              width: "FULL",
              title: "",
              config: {
                steps: [
                  {
                    label: "Inscritos",
                    value: "15.4k",
                    subtext: "Banco de Talentos",
                    status: "INFO"
                  },
                  {
                    label: "Triagem",
                    value: "4.2k",
                    subtext: "27% Conversão",
                    status: "NONE"
                  },
                  {
                    label: "Entrevistas",
                    value: "1.8k",
                    subtext: "Gestores + RH",
                    status: "NONE"
                  },
                  {
                    label: "Ofertas",
                    value: "320",
                    subtext: "Aprovados",
                    status: "SUCCESS"
                  },
                  {
                    label: "Contratados",
                    value: "295",
                    subtext: "92% Aceite",
                    status: "SUCCESS"
                  }
                ]
              }
            },
            {
              id: "qbr-b8",
              type: "CHART",
              width: "HALF",
              title: "SLA de Fechamento (Dias)",
              config: {
                type: "BAR",
                showLabels: true,
                data: "Área\tSLA Real\tMeta\nTech\t45\t40\nComercial\t22\t25\nOps\t18\t20\nCorp\t35\t30",
                showLegend: true
              }
            },
            {
              id: "qbr-b9",
              type: "TABLE",
              width: "HALF",
              title: "Eficiência por Fonte",
              config: {
                data: "Canal\tContratações\tCusto Médio\tTurnover Precoce\nLinkedIn\t120\tR$ 450\t2%\nIndicação\t85\tR$ 0\t1%\nGupy\t60\tR$ 120\t5%\nConsultoria\t30\tR$ 2.5k\t0%",
                infographicMode: "HEATMAP",
                targetColumns: [
                  2,
                  4
                ],
                columnFormats: [
                  "TEXT",
                  "INTEGER",
                  "CURRENCY",
                  "PERCENT"
                ],
                density: "NORMAL",
                columnWidths: [
                  25,
                  25,
                  25,
                  25
                ]
              }
            }
          ],
          paddingY: 7,
          paddingX: 10,
          rowGap: 12
        },
        {
          id: "qbr-page-3",
          title: "Gestão de Talentos",
          subtitle: "Mapeamento de potencial e performance (Ciclo 2024)",
          theme: "LIGHT",
          blocks: [
            {
              id: "qbr-b10",
              type: "SECTION",
              width: "FULL",
              title: "Matriz 9-Box (Liderança)",
              config: {
                showTitle: true,
                icon: "Grid3X3"
              }
            },
            {
              id: "qbr-b11",
              type: "NINE_BOX",
              width: "HALF",
              title: "",
              config: {
                data: [
                  {
                    label: "Risco",
                    count: 12
                  },
                  {
                    label: "Dilema",
                    count: 25
                  },
                  {
                    label: "Enigma",
                    count: 8
                  },
                  {
                    label: "Eficaz",
                    count: 45
                  },
                  {
                    label: "Core",
                    count: 68
                  },
                  {
                    label: "Forte",
                    count: 32
                  },
                  {
                    label: "Confliável",
                    count: 15
                  },
                  {
                    label: "Alta Perf.",
                    count: 40
                  },
                  {
                    label: "Top Talent",
                    count: 18
                  }
                ]
              }
            },
            {
              id: "qbr-b12",
              type: "INFOGRAPHIC_LIST",
              width: "HALF",
              title: "Ações de Desenvolvimento",
              config: {
                layout: "LIST",
                items: [
                  {
                    id: "1",
                    title: "Programa Top Talents",
                    description: "Mentoria com Diretoria para os 18 colaboradores no quadrante 9.",
                    icon: "Star",
                    color: "#10B981"
                  },
                  {
                    id: "2",
                    title: "PDI de Recuperação",
                    description: "Plano intensivo para os 12 colaboradores em Risco (Low/Low).",
                    icon: "TrendingUp",
                    color: "#F59E0B"
                  },
                  {
                    id: "3",
                    title: "Sucessão Crítica",
                    description: "Mapeados sucessores para 85% das posições chave.",
                    icon: "Users",
                    color: "#0079C2"
                  }
                ]
              }
            },
            {
              id: "qbr-b13",
              type: "GAUGE",
              width: "THIRD",
              title: "Aderência ao PDI",
              config: {
                value: 82,
                min: 0,
                max: 100,
                lowThreshold: 70,
                highThreshold: 90,
                format: "PERCENT"
              }
            },
            {
              id: "qbr-b14",
              type: "GAUGE",
              width: "THIRD",
              title: "Mobilidade Interna",
              config: {
                value: 35,
                min: 0,
                max: 50,
                lowThreshold: 20,
                highThreshold: 40,
                format: "PERCENT"
              }
            },
            {
              id: "qbr-b15",
              type: "GAUGE",
              width: "THIRD",
              title: "Retenção Chave",
              config: {
                value: 98,
                min: 80,
                max: 100,
                lowThreshold: 90,
                highThreshold: 95,
                format: "PERCENT"
              }
            },
            {
              id: "qbr-talent-analysis",
              type: "TEXT_BOX",
              width: "FULL",
              title: "Análise de Prontidão e Sucessão",
              config: {
                style: "PAR_MODEL",
                content: "PROBLEMA: Identificamos um gap de sucessão crítica na diretoria de Tecnologia, onde 40% das posições-chave não possuem sucessores prontos no curto prazo.\nAÇÃO: Iniciamos um programa acelerado de desenvolvimento para os colaboradores classificados como 'Forte' e 'Alta Performance' no 9-Box, com foco em mentoria executiva.\nRESULTADO: A projeção indica um aumento na cobertura de sucessão para 75% até o final do Q4, mitigando riscos operacionais."
              }
            }
          ],
          rowGap: 32
        },
        {
          id: "qbr-page-4",
          title: "Gestão Orçamentária",
          subtitle: "Acompanhamento das contas de pessoal e benefícios",
          theme: "LIGHT",
          blocks: [
            {
              id: "qbr-b16",
              type: "SECTION",
              width: "FULL",
              title: "Despesas de Pessoal (YTD)",
              config: {
                showTitle: true,
                icon: "DollarSign"
              }
            },
            {
              id: "qbr-fin-kpis",
              type: "BIG_NUMBERS",
              width: "FULL",
              title: "Resumo Financeiro",
              config: {
                columns: 4,
                kpis: [
                  {
                    label: "Orçamento Total",
                    current: 35.1,
                    prev: 34.5,
                    format: "CURRENCY",
                    abbreviate: true,
                    showDelta: true,
                    subMeasures: [
                      {
                        label: "Milhões",
                        value: "BRL"
                      }
                    ],
                    showSubMeasures: false
                  },
                  {
                    label: "Realizado YTD",
                    current: 34.7,
                    prev: 33.8,
                    format: "CURRENCY",
                    abbreviate: true,
                    showDelta: true,
                    showGoal: false,
                    goal: 35.1
                  },
                  {
                    label: "Saving/Déficit",
                    current: 400000,
                    prev: 0,
                    format: "CURRENCY",
                    abbreviate: true,
                    showDelta: false,
                    showTrend: false,
                    showGoal: true
                  },
                  {
                    label: "Forecast Q4",
                    current: 12.5,
                    prev: 11.8,
                    format: "CURRENCY",
                    abbreviate: true,
                    showDelta: true,
                    subMeasures: [
                      {
                        label: "Projeção",
                        value: "+3%"
                      }
                    ],
                    showSubMeasures: false
                  }
                ]
              }
            },
            {
              id: "qbr-b18",
              type: "CHART",
              width: "HALF",
              title: "Composição de Custo",
              config: {
                type: "DOUGHNUT",
                data: "Item\tValor\nSalários\t65\nBenefícios\t20\nEncargos\t10\nVariável\t5",
                showLabels: true,
                labelContent: "LABEL_PERCENT"
              }
            },
            {
              id: "qbr-b19",
              type: "CHART",
              width: "HALF",
              title: "Evolução de Horas Extras",
              config: {
                type: "LINE",
                data: "Mês\tValor (k)\nJan\t120\nFev\t115\nMar\t140\nAbr\t130\nMai\t110\nJun\t95",
                showLabels: true,
                showXAxis: true
              }
            },
            {
              id: "qbr-b17",
              type: "TABLE",
              width: "FULL",
              title: "Realizado vs Orçado por Diretoria",
              config: {
                data: "Diretoria\tOrçado (mi)\tRealizado (mi)\tVar %\nComercial\t12.5\t12.8\t2.4\nTecnologia\t8.2\t8\t-2.4\nOperações\t6.5\t6.5\t0\nFinanceiro\t4.1\t4.2\t2.4\nRH\t3.8\t3.6\t-5.2",
                infographicMode: "STATUS",
                targetColumns: [],
                columnFormats: [
                  "TEXT",
                  "CURRENCY",
                  "CURRENCY",
                  "PERCENT",
                  "TEXT"
                ],
                columnGoals: [
                  0,
                  0,
                  0,
                  0,
                  100
                ],
                lastRowIsTotal: false,
                columnWidths: [
                  25,
                  25,
                  25,
                  25
                ]
              }
            },
            {
              id: "qbr-fin-analysis",
              type: "TEXT_BOX",
              width: "FULL",
              title: "Análise de Desvios",
              config: {
                style: "ATTENTION",
                content: "O pico de horas extras em Março correlaciona-se com o período de fechamento fiscal e auditoria. Ações corretivas foram implementadas em Maio, resultando na tendência de queda observada em Junho (-13% vs Mai), o que deve normalizar o indicador até o fim do Q3."
              }
            }
          ],
          paddingY: 14,
          paddingX: 10
        },
        {
          id: "qbr-page-5",
          title: "Roadmap Estratégico",
          subtitle: "Cronograma de entregas e próximos passos",
          theme: "LIGHT",
          blocks: [
            {
              id: "qbr-road-intro-sec",
              type: "SECTION",
              width: "FULL",
              title: "Planejamento e Execução",
              config: {
                showTitle: true,
                align: "LEFT",
                icon: "MapPin"
              }
            },
            {
              id: "qbr-road-intro",
              type: "TEXT_BOX",
              width: "FULL",
              title: "",
              config: {
                style: "INTRO",
                content: "O roadmap para o Q4 prioriza a estabilização dos sistemas estruturantes (SAP) e a preparação da liderança para o ciclo de avaliação. A agenda foi ajustada para mitigar riscos de sobreposição com o período de fechamento anual."
              }
            },
            {
              id: "qbr-road-pillars",
              type: "INFOGRAPHIC_LIST",
              width: "FULL",
              title: "Pilares de Foco",
              config: {
                layout: "GRID",
                items: [
                  {
                    id: "pil1",
                    title: "Transformação Digital",
                    description: "Automação de 100% da folha.",
                    icon: "Cpu",
                    color: "#0079C2",
                    itemWidth: "33"
                  },
                  {
                    id: "pil2",
                    title: "Cultura de Performance",
                    description: "Novo modelo de avaliação.",
                    icon: "TrendingUp",
                    color: "#10B981",
                    itemWidth: "33"
                  },
                  {
                    id: "pil3",
                    title: "Eficiência Operacional",
                    description: "Redução de custos fixos.",
                    icon: "ShieldCheck",
                    color: "#F59E0B",
                    itemWidth: "33"
                  }
                ]
              }
            },
            {
              id: "qbr-road-obj",
              type: "TEXT_BOX",
              width: "FULL",
              title: "Definição de Sucesso",
              config: {
                style: "OBJECTIVE",
                content: "Concluir a migração sistêmica com zero impacto na folha de pagamento de Setembro e garantir 95% de adesão da liderança nos workshops de cultura."
              }
            },
            {
              id: "qbr-b20",
              type: "TIMELINE",
              width: "FULL",
              title: "Marcos do Próximo Trimestre",
              config: {
                events: [
                  {
                    year: "Jul",
                    title: "Go-Live SAP",
                    description: "Módulo Payroll, com novas possibilidade de pagamento e estruturação de visões de folha.",
                    icon: "server",
                    color: "#0079C2"
                  },
                  {
                    year: "Ago",
                    title: "Pesquisa Pulso",
                    description: "Clima e Engajamento, com todos os colaboradores que possuem cargos administrativos",
                    icon: "bar-chart-2",
                    color: "#00A7E7"
                  },
                  {
                    year: "Set",
                    title: "Ciclo de Mérito",
                    description: "Aprovação de aumentos e reconhecimento das pessoas que tiveram boas avaliações no ano anterior",
                    icon: "dollar-sign",
                    color: "#10B981"
                  },
                  {
                    year: "Out",
                    title: "Orçamento 2025",
                    description: "Início das rodadas, recebimento dos dados das áreas, alinhamento de informações com as lideranças",
                    icon: "calendar",
                    color: "#F59E0B"
                  }
                ]
              }
            }
          ],
          rowGap: 28
        }
      ],
      cover: {
        enabled: true,
        title: "Quarterly Business Review",
        subtitle: "Resultados Consolidados e Planejamento Estratégico Q3/2024",
        author: "Diretoria Executiva",
        manager: "Planejamento Estratégico",
        department: "DHO & People Analytics",
        date: "janeiro de 2026",
        theme: "BLUE",
        alignment: "LEFT"
      }
    }
  }
];
