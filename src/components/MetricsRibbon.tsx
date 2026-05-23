import { motion } from 'motion/react';
import { useSecurity } from '../context/SecurityContext';
import { Zap, BarChart3, ShieldCheck } from 'lucide-react';

const EASING = [0.16, 1, 0.3, 1] as const;

const CARD_CONFIG = [
  { icon: Zap, color: 'text-neon-green', bgGlow: 'bg-neon-green' },
  { icon: BarChart3, color: 'text-amber-accent', bgGlow: 'bg-amber-accent' },
  { icon: ShieldCheck, color: 'text-blue-400', bgGlow: 'bg-blue-400' },
];

export default function MetricsRibbon() {
  const { metrics } = useSecurity();

  const items = [
    { value: metrics.breachDetectionSpeed, label: metrics.breachDetectionLabel },
    { value: metrics.triageLoadReduction, label: metrics.triageLoadLabel },
    { value: metrics.systemStatus, label: metrics.systemStatusLabel },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {items.map((item, i) => {
        const config = CARD_CONFIG[i];
        const Icon = config.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.2, duration: 0.5, ease: EASING }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="relative group"
          >
            <div className="relative bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 overflow-hidden transition-colors duration-300 hover:border-zinc-700">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-zinc-500">
                    {item.label.split('(')[0].trim()}
                  </p>
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.4, duration: 0.4, ease: EASING }}
                    className={`text-2xl font-bold tracking-tight ${config.color}`}
                  >
                    {item.value}
                  </motion.p>
                  <p className="text-[10px] text-zinc-600 font-mono">
                    {item.label.includes('(') ? item.label.split('(')[1].replace(')', '') : ''}
                  </p>
                </div>
                <div className="relative">
                  <div className={`w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center ${config.color}`}>
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <motion.div
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                    className={`absolute inset-0 rounded-lg ${config.bgGlow} blur-lg`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
