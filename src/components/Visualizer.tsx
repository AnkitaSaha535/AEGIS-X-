import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useSecurity } from '../context/SecurityContext';

const EASING = [0.16, 1, 0.3, 1] as const;

interface Node {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  threatScore: number;
  status: string;
}

interface Link {
  source: string;
  target: string;
  threatScore: number;
}

const CENTER_X = 400;
const CENTER_Y = 225;
const RADIUS = 160;

function getNodeColor(threatScore: number, status: string): string {
  if (status === 'QUARANTINED') return '#EF4444';
  if (status === 'PENDING_QUARANTINE') return '#F59E0B';
  if (threatScore > 80) return '#EF4444';
  if (threatScore > 50) return '#F59E0B';
  return '#00FF66';
}

function getNodeOpacity(threatScore: number): number {
  return 0.3 + (threatScore / 100) * 0.7;
}

export default function Visualizer() {
  const { sessions } = useSecurity();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const { nodes, links } = useMemo(() => {
    const n: Node[] = sessions.map((s, i) => {
      const angle = (i / sessions.length) * Math.PI * 2 - Math.PI / 2;
      return {
        id: s.id,
        label: s.hostname,
        type: s.nodeType,
        x: CENTER_X + Math.cos(angle) * RADIUS,
        y: CENTER_Y + Math.sin(angle) * RADIUS,
        threatScore: s.threatScore,
        status: s.status,
      };
    });

    const l: Link[] = [];
    sessions.forEach((s, i) => {
      l.push({ source: 'center', target: s.id, threatScore: s.threatScore });
    });
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const combined = (sessions[i].threatScore + sessions[j].threatScore) / 2;
        if (combined > 50) {
          l.push({ source: sessions[i].id, target: sessions[j].id, threatScore: combined });
        }
      }
    }

    return { nodes: n, links: l };
  }, [sessions]);

  return (
    <div className="relative bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="absolute top-3 left-4 z-10 flex items-center gap-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Session Topology</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
            <span className="text-[8px] font-mono text-zinc-600">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-accent" />
            <span className="text-[8px] font-mono text-zinc-600">Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-accent" />
            <span className="text-[8px] font-mono text-zinc-600">Isolation</span>
          </div>
        </div>
      </div>

      <svg viewBox="0 0 800 450" className="w-full h-full min-h-[300px]" style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.3))' }}>
        <defs>
          <filter id="glow-red">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#EF4444" floodOpacity="0.6" />
          </filter>
          <filter id="glow-amber">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F59E0B" floodOpacity="0.6" />
          </filter>
          <filter id="glow-green">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00FF66" floodOpacity="0.4" />
          </filter>
          <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FF66" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00FF66" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={CENTER_X} cy={CENTER_Y} r="90" fill="url(#center-glow)" />

        {links.map((link) => {
          const isCenterLink = link.source === 'center';
          const targetNode = nodes.find(n => n.id === link.target);
          const sourceNode = isCenterLink ? null : nodes.find(n => n.id === link.source);
          const x1 = isCenterLink ? CENTER_X : sourceNode?.x ?? CENTER_X;
          const y1 = isCenterLink ? CENTER_Y : sourceNode?.y ?? CENTER_Y;
          const x2 = targetNode?.x ?? CENTER_X;
          const y2 = targetNode?.y ?? CENTER_Y;
          const isHighRisk = link.threatScore > 70;
          const linkColor = link.threatScore > 80 ? '#EF4444' : link.threatScore > 50 ? '#F59E0B' : '#00FF66';
          const linkOpacity = 0.15 + (link.threatScore / 100) * 0.5;

          return (
            <motion.line
              key={`${link.source}-${link.target}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={linkColor}
              strokeWidth={isHighRisk ? 1.5 : 0.7}
              strokeOpacity={linkOpacity}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: EASING }}
              filter={isHighRisk ? (link.threatScore > 80 ? 'url(#glow-red)' : 'url(#glow-amber)') : undefined}
            />
          );
        })}

        <motion.circle
          cx={CENTER_X} cy={CENTER_Y} r={20}
          fill="#0A0B0D" stroke="#00FF66" strokeWidth={1.5}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          filter="url(#glow-green)"
        />
        <text x={CENTER_X} y={CENTER_Y + 3.5} textAnchor="middle" fill="#00FF66" fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="bold" letterSpacing="0.5">
          CORE
        </text>

        {nodes.map((node, i) => {
          const isActive = activeNode === node.id;
          const color = getNodeColor(node.threatScore, node.status);
          const opacity = getNodeOpacity(node.threatScore);
          const r = isActive ? 24 : 18 + (node.threatScore / 100) * 6;
          const glowId = node.threatScore > 80 ? 'url(#glow-red)' : node.threatScore > 50 ? 'url(#glow-amber)' : 'url(#glow-green)';

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 150, damping: 18 }}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
              style={{ cursor: 'pointer' }}
            >
              {(node.status === 'PENDING_QUARANTINE' || node.threatScore > 80) && (
                <motion.circle
                  cx={node.x} cy={node.y} r={r + 8}
                  fill="none"
                  stroke={node.threatScore > 80 ? '#EF4444' : '#F59E0B'}
                  strokeWidth={0.5}
                  strokeOpacity={0.4}
                  animate={{ r: [r + 8, r + 16, r + 8], opacity: [0.4, 0.1, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <circle cx={node.x} cy={node.y} r={r} fill="#0A0B0D" stroke={color} strokeWidth={isActive ? 2 : 1.2} opacity={isActive ? 1 : opacity} filter={glowId} />
              <text x={node.x} y={node.y - r - 7} textAnchor="middle" fill={color} fontSize="8" fontFamily="JetBrains Mono, monospace" opacity={isActive ? 1 : 0.7}>
                {node.label}
              </text>
              <text x={node.x} y={node.y + 3.5} textAnchor="middle" fill="#E4E4E7" fontSize="6.5" fontFamily="JetBrains Mono, monospace" opacity={isActive ? 0.9 : 0.5}>
                {node.threatScore}%
              </text>
              <text x={node.x} y={node.y + r + 11} textAnchor="middle" fill="#71717A" fontSize="6" fontFamily="JetBrains Mono, monospace">
                {node.type}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {activeNode && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2, ease: EASING }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400"
        >
          {sessions.find(s => s.id === activeNode)?.userId} — {sessions.find(s => s.id === activeNode)?.ipAddress}
        </motion.div>
      )}
    </div>
  );
}
