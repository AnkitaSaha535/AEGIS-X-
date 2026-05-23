import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import LoginEntryPage from './components/LoginEntryPage';
import AdminLoginPage from './components/AdminLoginPage';
import UserLoginPage from './components/UserLoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetricsRibbon from './components/MetricsRibbon';
import Visualizer from './components/Visualizer';
import TraceFeed from './components/TraceFeed';
import FormInterface from './components/FormInterface';
import ChatInterface from './components/ChatInterface';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import GameInterface from './components/GameInterface';
import MoodDetector from './components/MoodDetector';
import { getSectorById, getToolById, SECTORS } from './data/sectors';
import type { Tool, SectorUsage } from './types';
import * as LucideIcons from 'lucide-react';

const EASING = [0.16, 1, 0.3, 1] as const;

const ICON_MAP: Record<string, LucideIcons.LucideIcon> = {
  Heart: LucideIcons.Heart, FileText: LucideIcons.FileText, MessageSquare: LucideIcons.MessageSquare,
  Activity: LucideIcons.Activity, ShieldCheck: LucideIcons.ShieldCheck, Shield: LucideIcons.Shield,
  Landmark: LucideIcons.Landmark, FileSearch: LucideIcons.FileSearch, AlertTriangle: LucideIcons.AlertTriangle,
  BarChart2: LucideIcons.BarChart2, CheckCircle2: LucideIcons.CheckCircle2, BookOpen: LucideIcons.BookOpen,
  Network: LucideIcons.Network, Search: LucideIcons.Search, Database: LucideIcons.Database,
  Map: LucideIcons.Map, Truck: LucideIcons.Truck, ArrowLeftRight: LucideIcons.ArrowLeftRight,
  Video: LucideIcons.Video, Radio: LucideIcons.Radio, Users: LucideIcons.Users,
  Sprout: LucideIcons.Sprout, Camera: LucideIcons.Camera, ScanFace: LucideIcons.ScanFace,
  ShieldAlert: LucideIcons.ShieldAlert, Siren: LucideIcons.Siren, Bug: LucideIcons.Bug,
  Gamepad2: LucideIcons.Gamepad2, DollarSign: LucideIcons.DollarSign, Target: LucideIcons.Target,
  LayoutDashboard: LucideIcons.LayoutDashboard, ThumbsUp: LucideIcons.ThumbsUp, ThumbsDown: LucideIcons.ThumbsDown,
  Sparkles: LucideIcons.Sparkles, TrendingUp: LucideIcons.TrendingUp, Zap: LucideIcons.Zap,
  Star: LucideIcons.Star, Crown: LucideIcons.Crown,
};

function LucideIcon({ name, className, ...props }: { name: string; className?: string; [key: string]: any }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} {...props} />;
}

function ToolIcon({ name, color, size }: { name: string; color: string; size?: string }) {
  return (
    <div
      className={`${size || 'w-9 h-9'} rounded-lg border flex items-center justify-center`}
      style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }}
    >
      <LucideIcon name={name} className="w-4 h-4" style={{ color }} />
    </div>
  );
}

function ToolView({ tool, sectorColor }: { tool: Tool; sectorColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASING }}
      className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden"
      style={{ minHeight: '400px' }}
    >
      <div
        className="px-5 py-3 border-b flex items-center gap-3"
        style={{ borderColor: `${sectorColor}20`, backgroundColor: `${sectorColor}05` }}
      >
        <ToolIcon name={tool.icon} color={sectorColor} size="w-8 h-8" />
        <div>
          <h3 className="text-sm font-bold text-white">{tool.title}</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">{tool.description}</p>
        </div>
      </div>
      {tool.id === 'mood-scanner' ? (
        <MoodDetector />
      ) : tool.type === 'chat' ? (
        <ChatInterface tool={tool} />
      ) : tool.type === 'form' ? (
        <FormInterface tool={tool} />
      ) : tool.type === 'dashboard' ? (
        <AnalyticsDashboard tool={tool} />
      ) : tool.type === 'game' ? (
        <GameInterface tool={tool} />
      ) : null}
    </motion.div>
  );
}

function SectorView({ sectorId }: { sectorId: string }) {
  const sector = getSectorById(sectorId);
  if (!sector) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASING }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <ToolIcon name={sector.icon} color={sector.color} size="w-10 h-10" />
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">{sector.title}</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">{sector.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sector.tools.map((tool, i) => (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ease: EASING }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-left group transition-all hover:border-zinc-700"
          >
            <div className="flex items-start gap-3 mb-3">
              <ToolIcon name={tool.icon} color={sector.color} size="w-8 h-8" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">{tool.title}</h4>
                <p className="text-[9px] text-zinc-600 mt-0.5 line-clamp-2">{tool.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${tool.color}15`, color: tool.color }}
              >
                {tool.type}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function AdminDashboardView() {
  const { role, displayName } = useAuth();
  const { metrics, sectorUsage, alerts } = useSecurity();
  const activeCount = alerts.filter(a => a.status !== 'DISMISSED').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'DISMISSED').length;

  const sectorTotals = useMemo(() => {
    const map = new Map<string, { name: string; count: number; color: string }>();
    sectorUsage.forEach(u => {
      const existing = map.get(u.sectorId);
      if (existing) existing.count += u.count;
      else {
        const sector = SECTORS.find(s => s.id === u.sectorId);
        map.set(u.sectorId, { name: u.sectorName, count: u.count, color: sector?.color || '#666' });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [sectorUsage]);

  const totalUsage = sectorTotals.reduce((s, u) => s + u.count, 0) || 1;
  const topSector = sectorTotals[0];

  return (
    <>
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">Admin Command Center</h2>
          <p className="text-[11px] text-zinc-600 font-mono mt-0.5">Full system oversight · Security analytics · Usage monitoring</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-red-500/10 border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {displayName} · Administrator
        </div>
      </div>

      <MetricsRibbon />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <Visualizer />
        </div>
        <div className="xl:col-span-2 space-y-3">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">System Health</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Breach Detection Speed', value: metrics.breachDetectionSpeed, status: 'operational' as const },
                { label: 'Triage Load Reduction', value: metrics.triageLoadReduction, status: 'operational' as const },
                { label: 'System Status', value: metrics.systemStatus, status: 'operational' as const },
                { label: 'Active Incidents', value: `${activeCount} (${criticalCount} critical)`, status: criticalCount > 0 ? 'degraded' as const : 'operational' as const },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-300">{item.value}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'operational' ? 'bg-neon-green' : 'bg-amber-accent animate-pulse'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Sector Usage (Bar Chart)</h3>
          {sectorTotals.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-zinc-600 text-[10px] font-mono">
              No usage data yet — start using sector tools to populate this chart.
            </div>
          ) : (
            <div className="space-y-3">
              {sectorTotals.map((s, i) => {
                const pct = (s.count / totalUsage) * 100;
                return (
                  <div key={s.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400 font-mono">{s.name}</span>
                      <span className="text-zinc-500">{s.count} uses</span>
                    </div>
                    <div className="h-5 bg-zinc-800 rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: EASING }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: s.color, opacity: 0.6 }}
                      />
                      <span className="absolute inset-0 flex items-center justify-end pr-2 text-[8px] font-mono text-zinc-300">
                        {Math.round(pct)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Usage Distribution (Pie Chart)</h3>
          {sectorTotals.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-zinc-600 text-[10px] font-mono">
              No usage data yet — start using sector tools to populate this chart.
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="relative w-36 h-36 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {sectorTotals.map((s, i) => {
                    const pct = s.count / totalUsage;
                    const prevTotal = sectorTotals.slice(0, i).reduce((sum, x) => sum + x.count / totalUsage, 0);
                    const circumference = 2 * Math.PI * 15;
                    const offset = circumference * (1 - prevTotal);
                    const length = circumference * pct;
                    return (
                      <motion.circle
                        key={s.name}
                        cx="18" cy="18" r="15"
                        fill="none"
                        stroke={s.color}
                        strokeWidth="3"
                        strokeDasharray={`${length} ${circumference - length}`}
                        strokeDashoffset={offset}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: EASING }}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-bold text-white">{totalUsage}</span>
                  <span className="text-[7px] font-mono text-zinc-500">Total Uses</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {sectorTotals.map(s => (
                  <div key={s.name} className="flex items-center gap-2 text-[9px]">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-zinc-400 flex-1 truncate">{s.name}</span>
                    <span className="text-zinc-500 font-mono">{Math.round((s.count / totalUsage) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <TraceFeed />
    </>
  );
}

function UserDashboardView() {
  const { displayName } = useAuth();
  const { sectorUsage, chatFeedback } = useSecurity();

  const sectorTotals = useMemo(() => {
    const map = new Map<string, { name: string; count: number; color: string; id: string }>();
    sectorUsage.forEach(u => {
      const existing = map.get(u.sectorId);
      if (existing) existing.count += u.count;
      else {
        const sector = SECTORS.find(s => s.id === u.sectorId);
        map.set(u.sectorId, { name: u.sectorName, count: u.count, color: sector?.color || '#666', id: u.sectorId });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [sectorUsage]);

  const topSector = sectorTotals[0];
  const likeCount = chatFeedback.filter(f => f.feedback === 'like').length;
  const totalFeedback = chatFeedback.filter(f => f.feedback !== null).length;

  const recommendations = useMemo(() => {
    if (!topSector) return [];
    const recs: Record<string, string[]> = {
      education: ['Try the Knowledge Gap Profiler to identify learning opportunities', 'Explore the Curriculum Topology Map for personalized learning paths'],
      teaching: ['Build a custom skill path with the Skill Path Builder', 'Challenge yourself with adaptive quizzes in Quiz Master'],
      mood: ['Log your mood in the Mood Journal to track patterns', 'Try the Breathing Guide for mindfulness exercises'],
      health: ['Run a PII scan on patient records for compliance', 'Explore the triage AI for emergency prioritization'],
      finance: ['Audit transactions with the Bias Audit Engine', 'Check the Equity Tracker for distribution analysis'],
      logistics: ['Optimize routes with Dynamic Dispatch AI', 'Run the supply chain risk assessment'],
      agriculture: ['Analyze soil data for crop recommendations', 'Check pest risk predictions for your region'],
      cybersecurity: ['Run a vulnerability assessment on your network', 'Check the MITRE ATT&CK threat mapping'],
      games: ['Test your skills with the Risk Navigator game', 'Challenge yourself in Resource Rally'],
    };
    return recs[topSector.id] || [`Explore more tools in ${topSector.name}`];
  }, [topSector]);

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">Welcome back, {displayName}</h2>
          <p className="text-[11px] text-zinc-600 font-mono mt-0.5">Explore sectors, learn with AI tools, and track your progress</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-blue-500/10 border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Operator
          </div>
        </div>
      </div>

      {topSector && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-xl border"
          style={{ backgroundColor: `${topSector.color}08`, borderColor: `${topSector.color}25` }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${topSector.color}15` }}>
              <LucideIcon name={SECTORS.find(s => s.id === topSector.id)?.icon || 'Star'} className="w-5 h-5" style={{ color: topSector.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-white">Most Used: {topSector.name}</h3>
                <span className="text-[9px] font-mono text-zinc-500">({topSector.count} sessions)</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">Based on your activity, here are some recommendations:</p>
              <ul className="space-y-1.5">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                    <LucideIcon name="Sparkles" className="w-3 h-3 shrink-0" style={{ color: topSector.color }} />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {totalFeedback > 0 && (
        <div className="mb-5 flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <LucideIcon name="ThumbsUp" className="w-3.5 h-3.5 text-neon-green" />
            <span className="text-[10px] text-zinc-400">{likeCount} helpful {likeCount === 1 ? 'response' : 'responses'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <LucideIcon name="ThumbsDown" className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[10px] text-zinc-400">{totalFeedback - likeCount} needs improvement</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <LucideIcon name="Star" className="w-3.5 h-3.5 text-amber-accent" />
            <span className="text-[10px] text-zinc-400">{totalFeedback} total {totalFeedback === 1 ? 'rating' : 'ratings'}</span>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">All Sectors</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          <span className="text-[8px] font-mono text-zinc-600">{SECTORS.length} available</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {SECTORS.map((sector, i) => {
          const usage = sectorTotals.find(s => s.id === sector.id);
          return (
            <motion.button
              key={sector.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, ease: EASING }}
              whileHover={{ y: -3, scale: 1.01 }}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-left group transition-all hover:border-zinc-700 relative overflow-hidden"
            >
              {usage && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
                  style={{ backgroundColor: sector.color, opacity: 0.5 }}
                />
              )}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${sector.color}15` }}>
                  <LucideIcon name={sector.icon} className="w-5 h-5" style={{ color: sector.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">{sector.title}</h4>
                  <p className="text-[10px] text-zinc-600 mt-0.5 line-clamp-2">{sector.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: `${sector.color}15`, color: sector.color }}>
                  {sector.tools.length} tools
                </span>
                {usage && (
                  <span className="text-[8px] font-mono text-zinc-600">{usage.count} used</span>
                )}
              </div>
              {usage && usage === sectorTotals[0] && (
                <span className="absolute top-3 right-3 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-accent/10 text-amber-accent border border-amber-accent/20">
                  Most Used
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </>
  );
}

function MainContent() {
  const { role } = useAuth();
  const { activeSectorId, activeToolId } = useSecurity();
  const sector = activeSectorId ? getSectorById(activeSectorId) : null;
  const tool = activeSectorId && activeToolId ? getToolById(activeSectorId, activeToolId) : null;

  return (
    <main className="ml-60 pt-16 min-h-screen">
      <div className="p-6 space-y-4">
        {tool ? (
          <ToolView tool={tool} sectorColor={sector?.color || '#00FF66'} />
        ) : sector ? (
          <SectorView sectorId={activeSectorId!} />
        ) : role === 'admin' ? (
          <AdminDashboardView />
        ) : (
          <UserDashboardView />
        )}
      </div>
    </main>
  );
}

type AuthPage = 'entry' | 'admin-login' | 'user-login' | null;

function AuthFlow() {
  const { isAuthenticated, login, loginWithGoogle } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>(null);
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding) {
    return (
      <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0">
        <LandingPage onEnter={() => { setShowLanding(false); setAuthPage('entry'); }} />
      </motion.div>
    );
  }

  if (isAuthenticated) {
    return (
      <motion.div
        key="dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen bg-midnight-950 text-zinc-300 font-sans antialiased"
      >
        <Sidebar />
        <Header />
        <MainContent />
      </motion.div>
    );
  }

  if (authPage === 'admin-login') {
    return (
      <AdminLoginPage
        onBack={() => setAuthPage('entry')}
        onLogin={(username, password) => login('admin', username, password)}
        onGoogleLogin={(name, email, photo) => loginWithGoogle('admin', name, email, photo)}
      />
    );
  }

  if (authPage === 'user-login') {
    return (
      <UserLoginPage
        onBack={() => setAuthPage('entry')}
        onLogin={(username, password) => login('user', username, password)}
        onGoogleLogin={(name, email, photo) => loginWithGoogle('user', name, email, photo)}
      />
    );
  }

  return (
    <LoginEntryPage
      onSelect={(panel) => setAuthPage(panel === 'admin' ? 'admin-login' : 'user-login')}
    />
  );
}

export default function App() {
  return (
    <SecurityProvider>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <AuthFlow />
        </AnimatePresence>
      </AuthProvider>
    </SecurityProvider>
  );
}
