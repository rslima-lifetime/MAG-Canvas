
import * as LucideIcons from 'lucide-react';

// Mapeamento de nomes legados (kebab-case) para componentes Lucide (PascalCase)
const LEGACY_MAPPING: Record<string, string> = {
  'map-pin': 'MapPin',
  'bar-chart-2': 'BarChart3',
  'dollar-sign': 'DollarSign',
  'pie-chart': 'PieChart',
  'alert-circle': 'AlertCircle',
  'check-circle': 'CheckCircle2',
  'arrow-right': 'ArrowRight',
  'trending-up': 'TrendingUp',
  'users': 'Users',
  'calendar': 'Calendar',
  'clock': 'Clock',
  'target': 'Target',
  'zap': 'Zap',
  'award': 'Award',
  'star': 'Star',
  'activity': 'Activity',
  'shield': 'ShieldCheck',
  'file-text': 'FileText',
  'settings': 'Settings',
  'search': 'Search',
  'filter': 'Filter',
  'plus': 'Plus',
  'trash-2': 'Trash2',
  'edit-3': 'Edit3',
  'more-horizontal': 'MoreHorizontal',
  'more-vertical': 'MoreVertical',
  'chevron-down': 'ChevronDown',
  'chevron-right': 'ChevronRight',
  'chevron-left': 'ChevronLeft',
  'chevron-up': 'ChevronUp',
  'layout': 'Layout',
  'briefcase': 'Briefcase',
  'mail': 'Mail',
  'phone': 'Phone',
  'globe': 'Globe',
  'rocket': 'Rocket',
  'code': 'Code',
  'server': 'Server',
  'database': 'Database',
  'cpu': 'Cpu',
  'layers': 'Layers',
  'box': 'Box',
  'package': 'Package',
  'truck': 'Truck',
  'shopping-cart': 'ShoppingCart',
  'credit-card': 'CreditCard',
  'lock': 'Lock',
  'unlock': 'Unlock',
  'user': 'User',
  'user-plus': 'UserPlus',
  'user-check': 'UserCheck',
  'user-x': 'UserX',
  'smile': 'Smile',
  'frown': 'Frown',
  'meh': 'Meh',
  'thumbs-up': 'ThumbsUp',
  'thumbs-down': 'ThumbsDown',
  'heart': 'Heart',
  'message-square': 'MessageSquare',
  'message-circle': 'MessageCircle',
  'camera': 'Camera',
  'video': 'Video',
  'mic': 'Mic',
  'image': 'Image',
  'music': 'Music',
  'play': 'Play',
  'pause': 'Pause',
  'stop-circle': 'StopCircle',
  'volume-2': 'Volume2',
  'wifi': 'Wifi',
  'bluetooth': 'Bluetooth',
  'battery': 'Battery',
  'sun': 'Sun',
  'moon': 'Moon',
  'cloud': 'Cloud',
  'rain': 'CloudRain',
  'link': 'Link',
  'external-link': 'ExternalLink',
  'menu': 'Menu',
  'x': 'X'
};

export const ICON_CATEGORIES = {
  STRATEGY: ['Target', 'Flag', 'MapPin', 'Compass', 'Route', 'Milestone', 'Mountain', 'Trophy', 'Award', 'Crown', 'Medal', 'Goal', 'Crosshair'],
  DATA: ['BarChart3', 'PieChart', 'LineChart', 'TrendingUp', 'TrendingDown', 'Activity', 'Sigma', 'Database', 'Table', 'FileSpreadsheet', 'Binary', 'Variable', 'GanttChart', 'ScatterChart', 'AreaChart'],
  PEOPLE: ['Users', 'UserPlus', 'UserCheck', 'UserCog', 'UserSearch', 'UserRound', 'UsersRound', 'Smile', 'HeartHandshake', 'Speech', 'MessageSquare', 'GraduationCap', 'Backpack', 'Briefcase'],
  TECH: ['Cpu', 'Server', 'Code', 'Code2', 'Terminal', 'Laptop', 'Smartphone', 'Monitor', 'Keyboard', 'Mouse', 'HardDrive', 'Network', 'Wifi', 'Cloud', 'Lock', 'ShieldCheck'],
  OPERATIONS: ['Settings', 'Sliders', 'Zap', 'Battery', 'Flashlight', 'Tool', 'Wrench', 'Hammer', 'Cog', 'Workflow', 'Layers', 'Box', 'Package', 'Truck', 'Factory', 'ClipboardList'],
  FINANCE: ['DollarSign', 'CreditCard', 'Wallet', 'Banknote', 'Coins', 'PiggyBank', 'Receipt', 'Percent', 'Calculator', 'Gem', 'Diamond'],
  TIME: ['Clock', 'Calendar', 'Timer', 'Hourglass', 'History', 'Watch', 'AlarmClock', 'CalendarDays', 'CalendarCheck'],
  INTERFACE: ['Layout', 'Grid', 'List', 'Check', 'X', 'Plus', 'Minus', 'AlertTriangle', 'Info', 'HelpCircle', 'Search', 'Filter', 'Eye', 'EyeOff', 'Edit3', 'Trash2', 'Copy', 'Share2', 'Save']
};

export const ALL_ICONS_FLAT = Object.values(ICON_CATEGORIES).flat();

/**
 * Resolve o nome de um ícone (string) para o componente React do Lucide.
 * Suporta nomes em PascalCase ('MapPin') e kebab-case ('map-pin').
 */
export const resolveIconComponent = (iconName: string) => {
  if (!iconName) return LucideIcons.HelpCircle;

  // 1. Tenta pegar pelo nome direto (PascalCase)
  let Component = (LucideIcons as any)[iconName];

  // 2. Se não achou, tenta mapear de kebab-case para PascalCase
  if (!Component && LEGACY_MAPPING[iconName]) {
    Component = (LucideIcons as any)[LEGACY_MAPPING[iconName]];
  }

  // 3. Fallback: Tenta converter kebab-case para PascalCase manualmente
  if (!Component && iconName.includes('-')) {
    const pascal = iconName.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    Component = (LucideIcons as any)[pascal];
  }

  return Component || LucideIcons.HelpCircle;
};
