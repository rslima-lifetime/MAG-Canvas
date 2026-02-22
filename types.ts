
export type BlockType = 'SECTION' | 'BIG_NUMBERS' | 'KPI' | 'TEXT_BOX' | 'TABLE' | 'CHART' | 'PROJECT_STATUS' | 'STORY_CONNECTOR' | 'STEP_PROCESS' | 'NINE_BOX' | 'TIMELINE' | 'INFOGRAPHIC_LIST' | 'PROJECT_CALENDAR' | 'GAUGE' | 'RANKING_LIST' | 'IMAGE' | 'FUNNEL' | 'RISK_MATRIX' | 'KANBAN' | 'COMPARISON';
export type BlockWidth = 'FULL' | 'THREE_QUARTERS' | 'TWO_THIRDS' | 'HALF' | 'THIRD' | 'QUARTER';
export type TextStyle = 'PLAIN' | 'INTRO' | 'ATTENTION' | 'INSIGHT' | 'BULLETS' | 'PAR_MODEL' | 'OBJECTIVE' | 'CONCLUSION';
export type TableStyle = 'NORMAL' | 'MATRIX';
export type TableTheme = 'MAG' | 'GREEN' | 'TEAL' | 'SLATE' | 'ROSE' | 'ORANGE';
export type ChartType = 'BAR' | 'COLUMN' | 'LINE' | 'AREA' | 'PIE' | 'DOUGHNUT' | 'FUNNEL';
export type LabelPosition = 'outside' | 'inside';
export type LabelContent = 'VALUE' | 'PERCENT' | 'LABEL_VALUE' | 'LABEL_PERCENT' | 'ALL';
export type NarrativeBadge = 'NONE' | 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'INFO' | 'TREND';
export type InfographicMode = 'NONE' | 'SPARKBAR' | 'GOAL' | 'HEATMAP' | 'STATUS';
export type KPIFormat = 'DEFAULT' | 'INTEGER' | 'DECIMAL' | 'PERCENT' | 'CURRENCY' | 'TIME' | 'DATE';
export type DensityLevel = number;
export type PageTheme = 'LIGHT' | 'BLUE';
export type ColumnAlignment = 'LEFT' | 'CENTER' | 'RIGHT';
export type DocumentFormat = 'REPORT' | 'PRESENTATION';
export type DesignSystem = 'STANDARD' | 'FUTURE';

export type ColumnFormatType = 'TEXT' | 'NUMBER' | 'PERCENT' | 'CURRENCY' | 'DATE' | 'TIME';

export type RiskStatus = 'CRITICAL' | 'ATTENTION' | 'CONTROLLED';

export interface RiskItem {
  id: string;
  status: RiskStatus;
  riskTitle: string;
  riskDetail: string;
  mitigationTitle: string;
  mitigationDetail: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  tags?: string[];
  owner?: string;
  date?: string;
  checklist?: ChecklistItem[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

/**
 * @interface FunnelStage
 * Data structure for Funnel Block
 */
export interface FunnelStage {
  id: string;
  label: string;
  value: number;
  color: string;
  icon?: string;
}

/**
 * @interface RankingItem
 * Data structure for Ranking List
 */
export interface RankingItem {
  id: string;
  label: string;
  description?: string;
  value: number;
  formattedValue?: string;
  image?: string;
  color?: string;
}

/**
 * @interface ProjectMilestone
 * Data structure for Project Status milestones
 */
export interface ProjectMilestone {
  id: string;
  label: string;
  date: string;
  completed: boolean;
}

/**
 * @interface KPIData
 * Data structure for KPI cards
 */
export interface KPIData {
  label: string;
  current: number;
  prev: number;
  format?: KPIFormat;
  abbreviate?: boolean;
  goal?: number;
  trendData?: string;
  subMeasures?: { label: string; value: string }[];
  showDelta?: boolean;
  showGoal?: boolean;
  showTrend?: boolean;
  showSubMeasures?: boolean;
}

/**
 * @interface TimelineEvent
 * Data structure for timeline milestones
 */
export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * @interface InfographicListItem
 * Data structure for infographic list components
 */
export interface InfographicListItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  imageFit?: 'cover' | 'contain' | 'fill';
  tag?: string;
  tagColor?: string;
  itemWidth?: '25' | '33' | '50' | '100';
  color?: string;
}

/**
 * @type ProjectStatus
 * Status options for calendar projects
 */
export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * @type ProjectPriority
 * Priority levels for calendar projects
 */
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * @interface CalendarProject
 * Individual project entry in the calendar
 */
export interface CalendarProject {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
}

/**
 * @interface CalendarDayData
 * Container for projects on a specific date
 */
export interface CalendarDayData {
  date: string;
  projects: CalendarProject[];
}

export interface CoverPage {
  enabled: boolean;
  topLabel?: string;
  title: string;
  subtitle: string;
  author: string;
  department: string;
  manager: string;
  date: string;
  theme: PageTheme;
  alignment?: 'LEFT' | 'CENTER' | 'RIGHT';
}

export interface ReportData {
  title: string;
  subtitle: string;
  pages: Page[];
  cover?: CoverPage;
  layoutFormat?: DocumentFormat;
  designSystem?: DesignSystem;
}

export interface Block {
  id: string;
  type: BlockType;
  width: BlockWidth;
  title: string;
  config: {
    annotation?: string;
    narrativeBadge?: NarrativeBadge;
    [key: string]: any;
  };
}

export interface Page {
  id: string;
  title: string;
  subtitle: string;
  theme?: PageTheme;
  blocks: Block[];
  rowGap?: number;
  columnGap?: number;
  paddingX?: number;
  paddingY?: number;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showLogo?: boolean;
  showDivider?: boolean;
  showFooter?: boolean;
  hidden?: boolean;
}

export const DEFAULT_REPORT_DATA: ReportData = {
  title: "Report Estratégico de People Analytics",
  subtitle: "Consolidado de KPIs e Insights de Capital Humano",
  layoutFormat: 'REPORT',
  designSystem: 'STANDARD',
  pages: [],
  cover: {
    enabled: true,
    topLabel: "Relatório Corporativo",
    title: "Report Estratégico de People Analytics",
    subtitle: "Insights e Governança de Dados para Tomada de Decisão",
    author: "Diretoria de Gente e Gestão",
    manager: "Gerência de Remuneração e Benefícios",
    department: "Núcleo de People Analytics",
    date: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    theme: 'BLUE',
    alignment: 'LEFT'
  }
};
