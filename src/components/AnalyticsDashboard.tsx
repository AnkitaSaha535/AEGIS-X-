import { motion } from 'motion/react';
import { BarChart2, TrendingUp, PieChart, Activity } from 'lucide-react';
import type { Tool } from '../types';

const EASING = [0.16, 1, 0.3, 1] as const;

const MOCK_CHART_DATA = {
  bar: [
    { label: 'Mon', value: 42 }, { label: 'Tue', value: 38 }, { label: 'Wed', value: 55 },
    { label: 'Thu', value: 48 }, { label: 'Fri', value: 63 }, { label: 'Sat', value: 29 }, { label: 'Sun', value: 35 },
  ],
  metrics: [
    { label: 'Total Processed', value: '12,847', change: '+23%' },
    { label: 'Active Tasks', value: '147', change: '+8%' },
    { label: 'Avg Response Time', value: '1.2s', change: '-12%' },
    { label: 'Accuracy Rate', value: '98.3%', change: '+0.7%' },
  ],
};

const COLOR_PALETTE = ['#00FF66', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#22C55E', '#EC4899'];

export default function AnalyticsDashboard({ tool }: { tool: Tool }) {
  return (
    <div className="flex flex-col h-full bg-zinc-900/30 p-5 overflow-y-auto">
      <div className="grid grid-cols-2 gap-3 mb-4">
        {MOCK_CHART_DATA.metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, ease: EASING }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5"
          >
            <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-zinc-600 mb-1">{m.label}</p>
            <p className="text-xl font-bold tracking-tight text-white">{m.value}</p>
            <span className={`text-[10px] font-mono ${m.change.startsWith('+') ? 'text-neon-green' : 'text-amber-accent'}`}>
              {m.change} vs previous period
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ease: EASING }}
        className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-500 flex items-center gap-1.5">
            <BarChart2 className="w-3 h-3" strokeWidth={1.5} />
            7-Day Activity Trend
          </h4>
          <TrendingUp className="w-3.5 h-3.5 text-neon-green" strokeWidth={1.5} />
        </div>
        <div className="flex items-end gap-2 h-28">
          {MOCK_CHART_DATA.bar.map((d, i) => {
            const maxVal = Math.max(...MOCK_CHART_DATA.bar.map(b => b.value));
            const heightPct = (d.value / maxVal) * 100;
            return (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.5, ease: EASING }}
                  className="w-full rounded-t-md relative group cursor-pointer"
                  style={{
                    backgroundColor: COLOR_PALETTE[i % COLOR_PALETTE.length],
                    opacity: 0.7,
                  }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[8px] font-mono text-zinc-300 whitespace-nowrap">
                    {d.value}
                  </div>
                </motion.div>
                <span className="text-[8px] font-mono text-zinc-600">{d.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ease: EASING }}
        className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4"
      >
        <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3 flex items-center gap-1.5">
          <PieChart className="w-3 h-3" strokeWidth={1.5} />
          Distribution Overview
        </h4>
        <div className="space-y-2.5">
          {[
            { label: 'Automated Processing', pct: 58, color: '#00FF66' },
            { label: 'Human Review', pct: 22, color: '#F59E0B' },
            { label: 'AI Analysis', pct: 15, color: '#3B82F6' },
            { label: 'Exceptions', pct: 5, color: '#EF4444' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-400 w-28 shrink-0 font-mono">{item.label}</span>
              <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ delay: 0.6, duration: 0.6, ease: EASING }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color, opacity: 0.7 }}
                />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">{item.pct}%</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
