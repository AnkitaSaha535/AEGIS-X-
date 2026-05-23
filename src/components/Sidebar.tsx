import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Radar, Activity, Users, FileText, Settings, ChevronDown, LayoutDashboard,
  Heart, Landmark, BookOpen, Truck, Sprout, MessageSquare, FileSearch, AlertTriangle,
  BarChart2, CheckCircle2, Network, Search, Database, Map, ArrowLeftRight, Video,
  Radio, Camera, ScanFace, ShieldAlert, Siren, Bug, Gamepad2, DollarSign, Target, Zap,
  Sparkles, Crown,
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { useAuth } from '../context/AuthContext';
import { SECTORS } from '../data/sectors';
import type { NavItem } from '../types';

const ICON_MAP: Record<string, any> = {
  Heart, Landmark, BookOpen, Truck, Sprout, MessageSquare, FileSearch, AlertTriangle,
  BarChart2, CheckCircle2, Network, Search, Database, Map, ArrowLeftRight, Video,
  Radio, Camera, ScanFace, Shield, Activity, Users, FileText, ShieldAlert, Siren, Bug,
  Gamepad2, DollarSign, Target, Zap, Sparkles, Crown,
};

const NAV_ITEMS: { id: NavItem; label: string; icon: typeof Shield; adminOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Radar },
  { id: 'threats', label: 'Threat Map', icon: Activity, adminOnly: true },
  { id: 'sessions', label: 'Sessions', icon: Users, adminOnly: true },
  { id: 'trace-feed', label: 'Trace Feed', icon: FileText, adminOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const EASING = [0.16, 1, 0.3, 1] as const;

function LucideIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return <LayoutDashboard className={className} />;
  return <Icon className={className} />;
}

export default function Sidebar() {
  const { activeNav, activeSectorId, activeToolId, setActiveNav, navigateToSector, navigateToTool, navigateToDashboard, alerts } = useSecurity();
  const { role, username, displayName } = useAuth();
  const [expandedSectors, setExpandedSectors] = useState<string[]>(['education']);
  const activeAlertCount = alerts.filter(a => a.status === 'ACTIVE').length;

  const toggleSector = (id: string) => {
    setExpandedSectors(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const visibleNavItems = NAV_ITEMS.filter(item => !item.adminOnly || role === 'admin');

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-midnight-900 border-r border-zinc-800 flex flex-col z-50">
      <motion.button
        onClick={navigateToDashboard}
        whileHover={{ x: 1 }}
        className="h-16 flex items-center gap-3 px-5 border-b border-zinc-800 shrink-0 w-full text-left hover:bg-zinc-800/20 transition-colors"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center">
            <Shield className="w-4 h-5 text-neon-green" strokeWidth={1.5} />
          </div>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-neon-green blur-[2px]"
          />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white leading-none">AEGIS-X</h1>
          <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-500 mt-0.5">Security Core</p>
        </div>
      </motion.button>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id && !activeSectorId;
          return (
            <motion.button
              key={item.id}
              onClick={() => { setActiveNav(item.id); navigateToDashboard(); }}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.3, ease: EASING }}
              className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 group ${
                isActive ? 'text-white bg-zinc-800/60' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-neon-green rounded-r-full"
                />
              )}
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="tracking-wide">{item.label}</span>
            </motion.button>
          );
        })}

        <div className="my-2 border-t border-zinc-800/50" />

        <p className="px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">Sectors</p>

        {SECTORS.map((sector) => {
          const isExpanded = expandedSectors.includes(sector.id);
          const isActive = activeSectorId === sector.id;
          return (
            <div key={sector.id} className="space-y-0.5">
              <motion.button
                onClick={() => { toggleSector(sector.id); navigateToSector(sector.id); }}
                whileHover={{ x: 1 }}
                transition={{ duration: 0.2 }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                  isActive && !activeToolId
                    ? 'text-white bg-zinc-800/60'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                }`}
              >
                <LucideIcon name={sector.icon} className="w-4 h-4 shrink-0" />
                <span className="tracking-wide truncate flex-1 text-left">{sector.title}</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: EASING }}
                >
                  <ChevronDown className="w-3 h-3 text-zinc-600" strokeWidth={1.5} />
                </motion.div>
              </motion.button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: EASING }}
                    className="overflow-hidden"
                  >
                    <div className="ml-3 pl-3 border-l border-zinc-800/50 space-y-0.5">
                      {sector.tools.map((tool) => {
                        const isToolActive = activeToolId === tool.id && activeSectorId === sector.id;
                        return (
                          <motion.button
                            key={tool.id}
                            onClick={() => navigateToTool(sector.id, tool.id)}
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.2, ease: EASING }}
                            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors duration-200 ${
                              isToolActive
                                ? 'text-white bg-zinc-800/40'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/20'
                            }`}
                          >
                            <LucideIcon name={tool.icon} className="w-3 h-3 shrink-0" />
                            <span className="truncate">{tool.title}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            role === 'admin' ? 'bg-red-500/10' : 'bg-blue-500/10'
          }`}>
            {role === 'admin'
              ? <Crown className="w-4 h-5 text-red-400" strokeWidth={1.5} />
              : <Shield className="w-4 h-5 text-blue-400" strokeWidth={1.5} />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: role === 'admin' ? '#EF4444' : '#3B82F6' }}>
              {role === 'admin' ? 'Admin Access' : 'User Access'}
            </p>
            <p className="text-[9px] text-zinc-500 mt-0.5 truncate">{displayName || username} · Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
