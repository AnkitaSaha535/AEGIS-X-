import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ChevronRight, Activity, ShieldCheck, Radio, Terminal } from 'lucide-react';

const EASING = [0.16, 1, 0.3, 1] as const;

const SECTOR_NODES = [
  { icon: Shield, label: 'Health', x: 20, y: 25, color: '#EF4444' },
  { icon: Activity, label: 'Finance', x: 80, y: 18, color: '#F59E0B' },
  { icon: ShieldCheck, label: 'Education', x: 85, y: 75, color: '#3B82F6' },
  { icon: Radio, label: 'Logistics', x: 15, y: 72, color: '#8B5CF6' },
  { icon: Terminal, label: 'Safety', x: 50, y: 10, color: '#00FF66' },
  { icon: Shield, label: 'Agriculture', x: 50, y: 88, color: '#22C55E' },
];

function ParticleField() {
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const arr = Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }));
    setParticles(arr);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-neon-green"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            opacity: 0.15,
          }}
          animate={{ opacity: [0.05, 0.25, 0.05], scale: [1, 1.5, 1] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-midnight-950 text-zinc-300 font-sans antialiased overflow-hidden">
      <ParticleField />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[600px] h-[600px] rounded-full border border-neon-green/10"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute w-[800px] h-[800px] rounded-full border border-neon-green/5"
        />
      </div>

      <header className="relative z-20 h-16 flex items-center px-8 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
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
            <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-600 mt-0.5">Security Command Center</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-neon-green"
            />
            <span className="text-[9px] font-mono text-zinc-500">All Systems Nominal</span>
          </div>
          <span className="text-[9px] font-mono text-zinc-700">v2.4.1</span>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-64px)] px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASING }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-neon-green"
              />
              Next-Generation Defense Platform
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: EASING }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]"
            >
              Autonomous
              <br />
              <span className="text-neon-green">Cyber Defense</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6, ease: EASING }}
              className="text-base text-zinc-500 max-w-xl mx-auto leading-relaxed"
            >
              AI-powered threat detection across 6 operational sectors with real-time
              human-in-the-loop verification and autonomous quarantine orchestration.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: EASING }}
            className="flex flex-col items-center gap-6"
          >
            <motion.button
              onClick={onEnter}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl border bg-zinc-900/50 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:bg-zinc-800/50"
              style={{ borderColor: 'rgba(0, 255, 102, 0.3)' }}
            >
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-neon-green"
              />
              Enter Command Center
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
            </motion.button>

            <p className="text-[9px] font-mono text-zinc-700 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              HITL-ML-001 · Human-in-the-loop active
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: EASING }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6"
        >
          {SECTOR_NODES.map((node, i) => {
            const NodeIcon = node.icon;
            return (
              <motion.div
                key={node.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.08, duration: 0.4, ease: EASING }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/40 border border-zinc-800/50"
              >
                <NodeIcon className="w-3 h-3" strokeWidth={1.5} style={{ color: node.color }} />
                <span className="text-[8px] font-medium text-zinc-500">{node.label}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
