import { motion } from 'motion/react';
import { Shield, ShieldCheck, ChevronRight } from 'lucide-react';

const EASING = [0.16, 1, 0.3, 1] as const;

export default function LoginEntryPage({ onSelect }: { onSelect: (panel: 'admin' | 'user') => void }) {
  return (
    <div className="fixed inset-0 bg-midnight-950 text-zinc-300 font-sans antialiased flex flex-col">
      <header className="h-16 flex items-center px-8 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center">
            <Shield className="w-4 h-5 text-neon-green" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">AEGIS-X</h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-600 mt-0.5">Security Command Center</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASING }}
            className="text-center space-y-2"
          >
            <h2 className="text-2xl font-bold tracking-tight text-white">Select Portal</h2>
            <p className="text-sm text-zinc-500">Choose your access level to enter the command center</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: EASING }}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect('admin')}
              className="group bg-zinc-900/60 border border-zinc-800 rounded-xl p-8 text-left transition-all hover:border-red-500/40"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6 text-red-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Admin Panel</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-5">
                Full system access — manage alerts, quarantine threats, configure sectors, and oversee all security operations.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-red-400">
                Enter Admin Panel
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: EASING }}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect('user')}
              className="group bg-zinc-900/60 border border-zinc-800 rounded-xl p-8 text-left transition-all hover:border-blue-500/40"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                <Shield className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">User Panel</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-5">
                Limited access — view dashboards, use sector tools, and interact with AI assistants for your work.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Enter User Panel
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </div>
            </motion.button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center text-[9px] font-mono text-zinc-700"
          >
            HITL-ML-001 · Role-based access control active
          </motion.p>
        </div>
      </main>
    </div>
  );
}
