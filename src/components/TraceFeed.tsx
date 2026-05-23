import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ShieldOff, Clock, ArrowRight, ExternalLink, Terminal, Ban } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { useAuth } from '../context/AuthContext';
import type { Alert } from '../types';

const EASING = [0.16, 1, 0.3, 1] as const;

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/25', dot: 'bg-red-500', label: 'CRITICAL' },
  high: { color: 'text-amber-accent', bg: 'bg-amber-500/10', border: 'border-amber-500/25', dot: 'bg-amber-accent', label: 'HIGH' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/25', dot: 'bg-yellow-400', label: 'MEDIUM' },
  low: { color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/25', dot: 'bg-zinc-400', label: 'LOW' },
};

const STATUS_CONFIG = {
  ACTIVE: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Active' },
  PENDING_QUARANTINE: { color: 'text-amber-accent', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Pending Review' },
  DISMISSED: { color: 'text-zinc-500', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', label: 'Dismissed' },
};

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AlertListItem({ alert, isSelected, onClick }: { alert: Alert; isSelected: boolean; onClick: () => void }) {
  const sev = SEVERITY_CONFIG[alert.severity];
  const stat = STATUS_CONFIG[alert.status];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.3, ease: EASING }}
      className={`w-full text-left px-4 py-3 border-b border-zinc-800/50 transition-all duration-200 group ${
        isSelected ? 'bg-zinc-800/40 border-l-2 border-l-neon-green' : 'hover:bg-zinc-800/20 border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center shrink-0 ${sev.bg} ${sev.color}`}>
          <AlertTriangle className="w-3 h-3" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
              {alert.title}
            </span>
            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${stat.bg} ${stat.color} ${stat.border}`}>
              {stat.label}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 truncate">{alert.description}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className={`text-[9px] font-mono font-bold ${sev.color}`}>{sev.label}</span>
            <span className="text-[9px] font-mono text-zinc-600 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" strokeWidth={1.5} />
              {timeAgo(alert.timestamp)}
            </span>
            <span className="text-[9px] font-mono text-zinc-600">{alert.source}</span>
          </div>
        </div>
        <ArrowRight className={`w-3.5 h-3.5 text-zinc-600 mt-1.5 shrink-0 transition-all duration-300 ${
          isSelected ? 'translate-x-0.5 text-neon-green' : 'group-hover:translate-x-0.5 group-hover:text-zinc-400'
        }`} strokeWidth={1.5} />
      </div>
    </motion.button>
  );
}

function TraceDetail({ alert, onDismiss, onQuarantine }: { alert: Alert; onDismiss: () => void; onQuarantine: () => void }) {
  const { role } = useAuth();
  const sev = SEVERITY_CONFIG[alert.severity];
  const traceLines = alert.trace.split('\n');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.35, ease: EASING }}
      className="h-full flex flex-col"
    >
      <div className="px-5 py-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-white truncate">{alert.title}</h3>
              <span className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${sev.bg} ${sev.color} ${sev.border}`}>
                {sev.label}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">{alert.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3" strokeWidth={1.5} />
            {alert.attackVector}
          </span>
          <span>Target: {alert.targetIp}</span>
          <span>{formatTime(alert.timestamp)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-0">
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-3 flex items-center gap-2">
          <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
          LangChain Intent Trace
        </div>
        <div className="space-y-1.5">
          {traceLines.map((line, i) => {
            if (!line.trim()) return null;
            const isDecision = line.includes('Decision');
            const isAlert = line.includes('ALERT');
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: EASING }}
                className={`text-[10px] font-mono leading-relaxed px-2.5 py-1 rounded ${
                  isDecision
                    ? 'bg-zinc-800/40 border-l-2 border-l-neon-green text-zinc-200'
                    : isAlert
                    ? 'bg-red-500/5 border-l-2 border-l-red-500 text-red-300'
                    : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                {line}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-zinc-800 shrink-0 flex items-center gap-3">
        {role === 'admin' ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onQuarantine}
              disabled={alert.status === 'PENDING_QUARANTINE' || alert.status === 'DISMISSED'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShieldOff className="w-3.5 h-3.5" strokeWidth={1.5} />
              {alert.status === 'PENDING_QUARANTINE' ? 'Quarantine Requested' : 'Confirm Quarantine'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDismiss}
              disabled={alert.status === 'DISMISSED'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-700/50 hover:text-zinc-300 hover:border-zinc-600/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {alert.status === 'DISMISSED' ? 'Dismissed' : 'Dismiss Alert'}
            </motion.button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800/30 border border-zinc-800/50 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
            <Ban className="w-3.5 h-3.5" strokeWidth={1.5} />
            Read-Only Access — Admin privileges required for actions
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function TraceFeed() {
  const { alerts, selectedAlertId, selectAlert, dismissAlert, confirmQuarantine } = useSecurity();
  const activeAlerts = alerts.filter(a => a.status !== 'DISMISSED');
  const selectedAlert = alerts.find(a => a.id === selectedAlertId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden min-h-[400px]">
      <div className="border-r border-zinc-800 flex flex-col">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Threat Alerts</h3>
            <span className="text-[9px] font-mono text-zinc-600">{activeAlerts.length} active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-mono text-zinc-600">Live</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/30">
          <AnimatePresence mode="popLayout">
            {activeAlerts.map(alert => (
              <motion.div key={alert.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <AlertListItem
                  alert={alert}
                  isSelected={selectedAlertId === alert.id}
                  onClick={() => selectAlert(alert.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col min-h-[300px] lg:min-h-0">
        <AnimatePresence mode="wait">
          {selectedAlert && selectedAlert.status !== 'DISMISSED' ? (
            <motion.div key={selectedAlert.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
              <TraceDetail
                alert={selectedAlert}
                onDismiss={() => dismissAlert(selectedAlert.id)}
                onQuarantine={() => confirmQuarantine(selectedAlert.id)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center px-6">
                <ShieldOff className="w-8 h-8 text-zinc-700 mx-auto mb-3" strokeWidth={1} />
                <p className="text-xs text-zinc-600 font-medium">No Alert Selected</p>
                <p className="text-[9px] text-zinc-700 mt-1 font-mono">Select a threat alert to view the LangChain intent trace</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
