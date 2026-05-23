import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, AlertTriangle, LogOut, ShieldCheck, Shield } from 'lucide-react';
import { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { useAuth } from '../context/AuthContext';

const EASING = [0.16, 1, 0.3, 1] as const;

export default function Header() {
  const { alerts, metrics } = useSecurity();
  const { role, displayName, username, photoURL, logout } = useAuth();
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const activeCount = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'PENDING_QUARANTINE').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'DISMISSED').length;

  return (
    <header className="fixed top-0 left-60 right-0 h-16 border-b border-zinc-800 bg-midnight-900/80 backdrop-blur-xl flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search threats, sessions, IPs..."
            className="w-72 bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:bg-zinc-800/80 transition-all duration-200"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900">
            <span className="text-[8px] font-mono text-zinc-600">⌘K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-neon-green"
            />
            <span className="text-[10px] font-mono text-zinc-400">{metrics.uptime}</span>
          </div>
        </div>

        <div className="relative">
          <motion.button
            onClick={() => setShowAlerts(!showAlerts)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-200"
          >
            <Bell className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            {activeCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-red-500 border border-red-400 text-[9px] font-bold text-white"
              >
                {activeCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showAlerts && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: EASING }}
                className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white tracking-wide">Active Alerts</span>
                  <span className="text-[10px] font-mono text-red-400">{criticalCount} critical</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {alerts.filter(a => a.status !== 'DISMISSED').slice(0, 5).map((alert, i) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                          alert.severity === 'critical' ? 'bg-red-500/15 text-red-400' :
                          alert.severity === 'high' ? 'bg-amber-500/15 text-amber-accent' :
                          'bg-zinc-800 text-zinc-500'
                        }`}>
                          <AlertTriangle className="w-3 h-3" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-200 truncate">{alert.title}</p>
                          <p className="text-[9px] font-mono text-zinc-500 mt-0.5">{alert.source}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <motion.button
            onClick={() => setShowUserMenu(!showUserMenu)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 transition-all duration-200"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden ${
              role === 'admin' ? 'bg-red-500/15' : 'bg-blue-500/15'
            }`}>
              {photoURL ? (
                <img src={photoURL} alt="" className="w-full h-full object-cover" />
              ) : role === 'admin' ? (
                <ShieldCheck className="w-3 h-3 text-red-400" strokeWidth={1.5} />
              ) : (
                <Shield className="w-3 h-3 text-blue-400" strokeWidth={1.5} />
              )}
            </div>
            <span className="text-[10px] font-medium text-zinc-300 max-w-[80px] truncate">{displayName || username}</span>
          </motion.button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: EASING }}
                className="absolute right-0 top-full mt-2 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-zinc-800">
                  <p className="text-xs font-medium text-white truncate">{username}</p>
                  <p className="text-[9px] font-mono text-zinc-500 mt-0.5 capitalize">{role} · Signed in</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
