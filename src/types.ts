export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'ACTIVE' | 'PENDING_QUARANTINE' | 'DISMISSED';
  source: string;
  timestamp: string;
  trace: string;
  attackVector: string;
  targetIp: string;
}

export interface Session {
  id: string;
  userId: string;
  hostname: string;
  ipAddress: string;
  threatScore: number;
  status: 'ACTIVE' | 'PENDING_QUARANTINE' | 'QUARANTINED';
  lastActive: string;
  nodeType: 'endpoint' | 'server' | 'gateway';
}

export interface Metrics {
  breachDetectionSpeed: string;
  breachDetectionLabel: string;
  triageLoadReduction: string;
  triageLoadLabel: string;
  systemStatus: string;
  systemStatusLabel: string;
  uptime: string;
}

export type NavItem = 'dashboard' | 'threats' | 'sessions' | 'trace-feed' | 'settings';

export type ToolType = 'form' | 'chat' | 'dashboard' | 'game';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder: string;
  aiContext: string;
}

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: ToolType;
  formFields: FormField[];
  aiSystemPrompt: string;
  color: string;
}

export interface Sector {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  tools: Tool[];
}

export interface SecurityState {
  alerts: Alert[];
  selectedAlertId: string | null;
  sessions: Session[];
  metrics: Metrics;
  activeNav: NavItem;
  activeSectorId: string | null;
  activeToolId: string | null;
}

export interface SectorUsage {
  sectorId: string;
  sectorName: string;
  toolId: string;
  toolName: string;
  count: number;
}

export interface ChatFeedback {
  toolId: string;
  messageIndex: number;
  feedback: 'like' | 'dislike' | null;
}

export interface SecurityContextType extends SecurityState {
  selectAlert: (id: string | null) => void;
  dismissAlert: (id: string) => void;
  confirmQuarantine: (id: string) => void;
  setActiveNav: (nav: NavItem) => void;
  navigateToSector: (id: string) => void;
  navigateToTool: (sectorId: string, toolId: string) => void;
  navigateToDashboard: () => void;
  generateAlert: () => void;
  trackToolUsage: (sectorId: string, toolId: string) => void;
  sectorUsage: SectorUsage[];
  chatFeedback: ChatFeedback[];
  addFeedback: (toolId: string, messageIndex: number, feedback: 'like' | 'dislike') => void;
}

export type UserRole = 'admin' | 'user';

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  username: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthContextType extends AuthState {
  login: (role: UserRole, username: string, password: string) => boolean;
  loginWithGoogle: (role: UserRole, displayName: string, email: string, photoURL: string) => void;
  logout: () => void;
}
