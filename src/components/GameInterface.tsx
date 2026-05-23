import { useState, useEffect, useRef, useCallback, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Timer, RotateCcw, Star, Target, Zap, Heart, DollarSign, Truck, AlertTriangle, Shield } from 'lucide-react';
import type { Tool } from '../types';

const EASING = [0.16, 1, 0.3, 1] as const;

interface GameProps { onScore: (points: number) => void; onGameOver: () => void; }

function BudgetAllocator({ onScore, onGameOver }: GameProps) {
  const DEPARTMENTS = [
    { id: 'health', label: 'Healthcare', base: 20, color: '#EF4444', icon: Heart },
    { id: 'education', label: 'Education', base: 18, color: '#3B82F6', icon: Star },
    { id: 'defense', label: 'Defense', base: 22, color: '#00FF66', icon: Shield },
    { id: 'infra', label: 'Infrastructure', base: 16, color: '#F59E0B', icon: Zap },
    { id: 'research', label: 'Research', base: 14, color: '#8B5CF6', icon: Target },
    { id: 'social', label: 'Social Services', base: 10, color: '#EC4899', icon: Heart },
  ];
  const totalBudget = 100;
  const [allocations, setAllocations] = useState<Record<string, number>>(
    Object.fromEntries(DEPARTMENTS.map(d => [d.id, d.base]))
  );
  const [round, setRound] = useState(1);
  const [crisis, setCrisis] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const targetRound = 5;

  const triggerCrisis = useCallback(() => {
    const dept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
    setCrisis(dept.label);
  }, []);

  useEffect(() => {
    if (round > 1) triggerCrisis();
  }, [round, triggerCrisis]);

  const vals = Object.values(allocations) as number[];
  const used = vals.reduce((a, b) => a + b, 0);
  const remaining = totalBudget - used;

  const adjust = (id: string, delta: number) => {
    if (submitted) return;
    setAllocations(prev => {
      const current = prev[id];
      const newVal = Math.max(0, Math.min(100, current + delta));
      const diff = newVal - current;
      if (remaining - diff < 0) return prev;
      return { ...prev, [id]: newVal };
    });
  };

  const handleSubmit = () => {
    const balance = DEPARTMENTS.map(d => {
      const alloc = allocations[d.id];
      const diff = Math.abs(alloc - d.base);
      return diff <= 5 ? 20 : diff <= 10 ? 10 : 0;
    }).reduce((a, b) => a + b, 0);
    const bonus = crisis ? 15 : 0;
    const points = balance + bonus + Math.max(0, remaining * 2);
    onScore(points);
    setSubmitted(true);
    if (round >= targetRound) { setTimeout(onGameOver, 1000); return; }
    setTimeout(() => {
      setRound(r => r + 1);
      setSubmitted(false);
      setCrisis(null);
      setAllocations(Object.fromEntries(DEPARTMENTS.map(d => [d.id, d.base])));
    }, 1500);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-amber-accent" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Budget Allocator</h4>
            <p className="text-[9px] text-zinc-500 font-mono">Round {round}/{targetRound}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-[9px] font-mono text-zinc-500">Budget</span>
          <span className={`text-xs font-bold font-mono ${remaining >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
            ${remaining}M
          </span>
        </div>
      </div>

      <AnimatePresence>
        {crisis && !submitted && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" strokeWidth={1.5} />
            <span className="text-[10px] text-red-300 font-mono">Crisis: {crisis} department needs +5% emergency funding!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {DEPARTMENTS.map(dept => {
          const val = allocations[dept.id];
          const Icon = dept.icon;
          const pct = (val / totalBudget) * 100;
          return (
            <div key={dept.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-3 h-3" strokeWidth={1.5} style={{ color: dept.color }} />
                  <span className="text-[10px] text-zinc-400 font-medium">{dept.label}</span>
                </div>
                <motion.span key={val} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                  className="text-[10px] font-mono text-zinc-300 font-bold">${val}M</motion.span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => adjust(dept.id, -2)}
                  disabled={submitted || val <= 0}
                  className="w-6 h-6 rounded flex items-center justify-center bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 text-xs font-bold transition-all">−</motion.button>
                <div className="flex-1 h-3 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div layout className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: dept.color, opacity: 0.7 }} />
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => adjust(dept.id, 2)}
                  disabled={submitted || remaining < 2}
                  className="w-6 h-6 rounded flex items-center justify-center bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 text-xs font-bold transition-all">+</motion.button>
              </div>
            </div>
          );
        })}
      </div>

      <motion.button onClick={handleSubmit} disabled={submitted || remaining < 0}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-accent text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-all disabled:opacity-40"
      >
        {submitted ? 'Calculating Score...' : remaining < 0 ? 'Over Budget!' : `Submit Budget ($${remaining}M remaining)`}
      </motion.button>
    </div>
  );
}

function TriageCommander({ onScore, onGameOver }: GameProps) {
  const SYMPTOMS = [
    { label: 'Chest Pain', zone: 'critical', color: '#EF4444', icon: '💔' },
    { label: 'Deep Laceration', zone: 'critical', color: '#EF4444', icon: '🩸' },
    { label: 'Difficulty Breathing', zone: 'critical', color: '#EF4444', icon: '🫁' },
    { label: 'Fractured Arm', zone: 'urgent', color: '#F59E0B', icon: '🦴' },
    { label: 'High Fever', zone: 'urgent', color: '#F59E0B', icon: '🌡️' },
    { label: 'Moderate Burn', zone: 'urgent', color: '#F59E0B', icon: '🔥' },
    { label: 'Minor Cut', zone: 'stable', color: '#22C55E', icon: '🩹' },
    { label: 'Mild Headache', zone: 'stable', color: '#22C55E', icon: '🤕' },
    { label: 'Skin Rash', zone: 'stable', color: '#22C55E', icon: '🔴' },
    { label: 'Sprained Ankle', zone: 'stable', color: '#22C55E', icon: '🦶' },
  ];
  const ZONES = [
    { id: 'critical', label: 'CRITICAL', color: '#EF4444', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    { id: 'urgent', label: 'URGENT', color: '#F59E0B', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    { id: 'stable', label: 'ROUTINE', color: '#22C55E', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  ];
  const [patients, setPatients] = useState<{ id: number; symptom: typeof SYMPTOMS[0] }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ id: number; correct: boolean } | null>(null);
  const roundRef = useRef(1);

  useEffect(() => {
    const count = 2 + roundRef.current;
    const shuffled = [...SYMPTOMS].sort(() => Math.random() - 0.5).slice(0, count);
    setPatients(shuffled.map((s, i) => ({ id: Date.now() + i, symptom: s })));
  }, []);

  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) { setGameOver(true); onGameOver(); return; }
    const t = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, gameOver, onGameOver]);

  const triage = (patientId: number, zoneId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;
    const correct = patient.symptom.zone === zoneId;
    const pts = correct ? (10 + streak * 2) : -5;
    setScore(s => s + pts);
    if (correct) { setStreak(s => s + 1); } else { setStreak(0); }
    onScore(correct ? pts : 0);
    setFeedback({ id: patientId, correct });
    setTimeout(() => setFeedback(null), 300);
    setPatients(p => p.filter(p => p.id !== patientId));
    if (patients.length <= 1) {
      roundRef.current++;
      const count = 2 + roundRef.current;
      const shuffled = [...SYMPTOMS].sort(() => Math.random() - 0.5).slice(0, Math.min(count, SYMPTOMS.length));
      setPatients(shuffled.map((s, i) => ({ id: Date.now() + i, symptom: s })));
      setTimeLeft(t => Math.min(t + 8, 45));
    }
  };

  if (gameOver) return null;

  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <Heart className="w-4 h-4 text-red-400" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Triage Commander</h4>
            <p className="text-[9px] text-zinc-500 font-mono">Round {roundRef.current}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
            <Star className="w-3 h-3 text-amber-accent" strokeWidth={1.5} />
            <span className="text-[10px] font-mono font-bold text-white">{score}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${timeLeft <= 10 ? 'bg-red-500/10 border-red-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
            <Timer className={`w-3 h-3 ${timeLeft <= 10 ? 'text-red-400' : 'text-zinc-400'}`} strokeWidth={1.5} />
            <span className={`text-[10px] font-mono font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>{timeLeft}s</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {streak >= 3 && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center text-[10px] text-amber-accent font-bold uppercase tracking-wider">
            🔥 {streak}x Streak! +{streak * 2} bonus per patient
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2">
        {ZONES.map(zone => (
          <div key={zone.id} className={`${zone.bg} ${zone.border} border rounded-xl p-2.5 min-h-[120px]`}>
            <p className="text-[8px] font-bold uppercase tracking-wider mb-1.5 text-center" style={{ color: zone.color }}>{zone.label}</p>
            <div className="space-y-1">
              {patients.filter(p => false).length === 0 && zone.id === 'critical' && null}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <AnimatePresence>
          {patients.map(patient => (
            <motion.div key={patient.id} layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700 active:scale-95 transition-all"
              onClick={() => {
                const zone = window.prompt('Triage to: (c)ritical, (u)rgent, or (s)table?');
                if (zone === 'c') triage(patient.id, 'critical');
                else if (zone === 'u') triage(patient.id, 'urgent');
                else if (zone === 's') triage(patient.id, 'stable');
              }}
            >
              <span className="text-lg">{patient.symptom.icon}</span>
              <p className="text-[9px] text-zinc-300 mt-0.5 text-center">{patient.symptom.label}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SupplyRunner({ onScore, onGameOver }: GameProps) {
  const GRID = 6;
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [targetPos] = useState({ x: GRID - 1, y: GRID - 1 });
  const [obstacles, setObstacles] = useState<{ x: number; y: number }[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(100);
  const [collected, setCollected] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const targetCollect = 5;
  const [collectibles, setCollectibles] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const obs: { x: number; y: number }[] = [];
    const cols: { x: number; y: number }[] = [];
    for (let i = 0; i < 4; i++) {
      let o;
      do { o = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
      while ((o.x === 0 && o.y === 0) || (o.x === GRID - 1 && o.y === GRID - 1) || obs.some(p => p.x === o.x && p.y === o.y));
      obs.push(o);
    }
    for (let i = 0; i < targetCollect; i++) {
      let c;
      do { c = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
      while ((c.x === 0 && c.y === 0) || (c.x === GRID - 1 && c.y === GRID - 1) || obs.some(p => p.x === c.x && p.y === c.y) || cols.some(p => p.x === c.x && p.y === c.y));
      cols.push(c);
    }
    setObstacles(obs);
    setCollectibles(cols);
  }, []);

  const move = (dx: number, dy: number) => {
    if (gameOver) return;
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    if (newX < 0 || newX >= GRID || newY < 0 || newY >= GRID) return;
    if (obstacles.some(o => o.x === newX && o.y === newY)) {
      setScore(s => Math.max(0, s - 15));
      return;
    }
    setPlayerPos({ x: newX, y: newY });
    setMoves(m => m + 1);
    setScore(s => Math.max(0, s - 2));
    const collectedIdx = collectibles.findIndex(c => c.x === newX && c.y === newY);
    if (collectedIdx >= 0) {
      setCollectibles(c => c.filter((_, i) => i !== collectedIdx));
      setCollected(c => c + 1);
      setScore(s => s + 25);
    }
    if (newX === targetPos.x && newY === targetPos.y) {
      const finalScore = score + collected * 30 + Math.max(0, 100 - moves);
      onScore(finalScore);
      setGameOver(true);
      setTimeout(onGameOver, 800);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move(0, -1);
      if (e.key === 'ArrowDown') move(0, 1);
      if (e.key === 'ArrowLeft') move(-1, 0);
      if (e.key === 'ArrowRight') move(1, 0);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (gameOver) return null;

  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <Truck className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Supply Runner</h4>
            <p className="text-[9px] text-zinc-500 font-mono">Collect {collected}/{targetCollect} · {moves} moves</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
          <Trophy className="w-3 h-3 text-amber-accent" strokeWidth={1.5} />
          <span className="text-[10px] font-mono font-bold text-white">{score}</span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1 max-w-[300px] mx-auto">
        {Array.from({ length: GRID * GRID }).map((_, i) => {
          const x = i % GRID;
          const y = Math.floor(i / GRID);
          const isPlayer = x === playerPos.x && y === playerPos.y;
          const isTarget = x === targetPos.x && y === targetPos.y;
          const isObstacle = obstacles.some(o => o.x === x && o.y === y);
          const isCollectible = collectibles.some(c => c.x === x && c.y === y);
          return (
            <motion.div key={i} layout
              className={`aspect-square rounded-md border flex items-center justify-center text-[8px] font-mono transition-all ${
                isPlayer ? 'bg-neon-green/20 border-neon-green text-neon-green scale-110 z-10' :
                isTarget ? 'bg-purple-500/20 border-purple-500 text-purple-300' :
                isObstacle ? 'bg-red-500/20 border-red-500/40 text-red-400' :
                isCollectible ? 'bg-amber-500/20 border-amber-500/40 text-amber-accent' :
                'bg-zinc-900 border-zinc-800 text-zinc-700'
              }`}
            >
              {isPlayer ? '🚚' : isTarget ? '🏁' : isObstacle ? '🧱' : isCollectible ? '📦' : ''}
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-center gap-3">
        {[
          { dx: 0, dy: -1, label: '↑' }, { dx: -1, dy: 0, label: '←' },
          { dx: 0, dy: 1, label: '↓' }, { dx: 1, dy: 0, label: '→' },
        ].map(btn => (
          <motion.button key={btn.label} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => move(btn.dx, btn.dy)}
            className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 text-lg font-bold transition-all"
          >{btn.label}</motion.button>
        ))}
      </div>
    </div>
  );
}

function RiskNavigator({ onScore, onGameOver }: GameProps) {
  const NODES = [
    { id: 0, label: 'Start', x: 10, y: 50, color: '#00FF66' },
    { id: 1, label: 'Finance', x: 30, y: 25, color: '#F59E0B' },
    { id: 2, label: 'Health', x: 30, y: 75, color: '#EF4444' },
    { id: 3, label: 'Logistics', x: 55, y: 50, color: '#8B5CF6' },
    { id: 4, label: 'Tech', x: 75, y: 25, color: '#3B82F6' },
    { id: 5, label: 'Security', x: 75, y: 75, color: '#22C55E' },
    { id: 6, label: 'Finish', x: 92, y: 50, color: '#00FF66' },
  ];
  const EDGES = [
    { from: 0, to: 1 }, { from: 0, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 3 },
    { from: 3, to: 4 }, { from: 3, to: 5 }, { from: 4, to: 6 }, { from: 5, to: 6 },
  ];
  const EVENTS = [
    { nodeId: 1, text: 'Market Crash! -15pts', penalty: 15 },
    { nodeId: 1, text: 'IPO Success! +20pts', penalty: -20 },
    { nodeId: 2, text: 'Pandemic Outbreak! -20pts', penalty: 20 },
    { nodeId: 2, text: 'Vaccine Breakthrough! +25pts', penalty: -25 },
    { nodeId: 3, text: 'Supply Chain Disrupted! -10pts', penalty: 10 },
    { nodeId: 3, text: 'Route Optimized! +15pts', penalty: -15 },
    { nodeId: 4, text: 'Cyber Attack! -25pts', penalty: 25 },
    { nodeId: 4, text: 'AI Deployed! +30pts', penalty: -30 },
    { nodeId: 5, text: 'Breach Detected! -20pts', penalty: 20 },
    { nodeId: 5, text: 'Threat Neutralized! +20pts', penalty: -20 },
  ];
  const [currentNode, setCurrentNode] = useState(0);
  const [score, setScore] = useState(100);
  const [visited, setVisited] = useState<number[]>([0]);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const navigate = (nodeId: number) => {
    if (gameOver || visited.includes(nodeId)) return;
    const edge = EDGES.find(e => e.from === currentNode && e.to === nodeId);
    if (!edge) return;
    const nodeEvents = EVENTS.filter(e => e.nodeId === nodeId);
    let pts = 0;
    let log = `→ ${NODES.find(n => n.id === nodeId)?.label}`;
    if (nodeEvents.length > 0) {
      const event = nodeEvents[Math.floor(Math.random() * nodeEvents.length)];
      pts = event.penalty;
      log += `: ${event.text}`;
    }
    setScore(s => Math.max(0, s - pts));
    setVisited(v => [...v, nodeId]);
    setEventLog(e => [log, ...e]);
    setCurrentNode(nodeId);
    if (nodeId === 6) {
      const finalScore = score + Math.max(0, 100 - visited.length * 5);
      onScore(finalScore);
      setGameOver(true);
      setTimeout(onGameOver, 800);
    }
  };

  if (gameOver) return null;

  const availableNodes = EDGES.filter(e => e.from === currentNode && !visited.includes(e.to)).map(e => e.to);

  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Target className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Risk Navigator</h4>
            <p className="text-[9px] text-zinc-500 font-mono">{NODES.find(n => n.id === currentNode)?.label} → Finish</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] font-mono font-bold text-white">{score}</span>
        </div>
      </div>

      <svg viewBox="0 0 100 100" className="w-full h-32 bg-zinc-900/50 rounded-xl border border-zinc-800">
        {EDGES.map(edge => {
          const from = NODES[edge.from];
          const to = NODES[edge.to];
          const isActive = visited.includes(from.id) && (visited.includes(to.id) || availableNodes.includes(to.id));
          return (
            <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isActive ? '#00FF66' : '#27272A'} strokeWidth={isActive ? 1.5 : 0.8} strokeOpacity={isActive ? 0.6 : 0.3} />
          );
        })}
        {NODES.map(node => {
          const isCurrent = currentNode === node.id;
          const isAvail = availableNodes.includes(node.id);
          const isDone = visited.includes(node.id) && !isCurrent;
          return (
            <g key={node.id} onClick={() => isAvail && navigate(node.id)} style={{ cursor: isAvail ? 'pointer' : 'default' }}>
              <motion.circle cx={node.x} cy={node.y} r={isCurrent ? 6 : 4}
                fill={isCurrent ? node.color : isDone ? node.color : isAvail ? '#27272A' : '#18181B'}
                stroke={isCurrent ? node.color : isAvail ? node.color : '#27272A'}
                strokeWidth={1.5}
                animate={isCurrent ? { r: [6, 7, 6] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <text x={node.x} y={node.y + 10} textAnchor="middle" fill={isCurrent || isDone ? '#E4E4E7' : '#52525B'}
                fontSize="3" fontFamily="JetBrains Mono, monospace" fontWeight="bold">{node.label}</text>
            </g>
          );
        })}
      </svg>

      <div className="flex gap-2 justify-center">
        {availableNodes.map(id => {
          const n = NODES.find(node => node.id === id);
          if (!n) return null;
          return (
            <motion.button key={id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate(id)}
              className="px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all"
              style={{ backgroundColor: `${n.color}15`, borderColor: `${n.color}30`, color: n.color }}
            >
              → {n.label}
            </motion.button>
          );
        })}
      </div>

      <div className="max-h-20 overflow-y-auto space-y-0.5">
        {eventLog.slice(0, 4).map((log, i) => (
          <p key={i} className="text-[8px] font-mono text-zinc-500">{log}</p>
        ))}
      </div>
    </div>
  );
}

function ResourceRally({ onScore, onGameOver }: GameProps) {
  const CHALLENGES = [
    { sector: 'Finance', prompt: 'Fraud Detected!', correct: 'Audit', color: '#F59E0B' },
    { sector: 'Health', prompt: 'Patient Critical!', correct: 'Triage', color: '#EF4444' },
    { sector: 'Logistics', prompt: 'Route Blocked!', correct: 'Reroute', color: '#8B5CF6' },
    { sector: 'Cyber', prompt: 'Breach Active!', correct: 'Contain', color: '#00FF66' },
    { sector: 'Education', prompt: 'Curriculum Gap!', correct: 'Adapt', color: '#3B82F6' },
    { sector: 'Safety', prompt: 'Alert Triggered!', correct: 'Verify', color: '#22C55E' },
  ];
  const OPTIONS = ['Audit', 'Triage', 'Reroute', 'Contain', 'Adapt', 'Verify'];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [combo, setCombo] = useState(0);
  const shuffled = useRef([...CHALLENGES].sort(() => Math.random() - 0.5));

  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) { setGameOver(true); onGameOver(); return; }
    const t = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, gameOver, onGameOver]);

  const challenge = shuffled.current[currentIdx % shuffled.current.length];

  const answer = (option: string) => {
    if (gameOver) return;
    const correct = option === challenge.correct;
    if (correct) {
      const pts = 10 + combo * 3;
      setScore(s => s + pts);
      setCombo(c => c + 1);
      onScore(pts);
      setFeedback('correct');
    } else {
      setCombo(0);
      setFeedback('wrong');
    }
    setTimeout(() => { setFeedback(null); setCurrentIdx(i => i + 1); }, 400);
  };

  if (gameOver) return null;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Resource Rally</h4>
            <p className="text-[9px] text-zinc-500 font-mono">Challenge {currentIdx + 1}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {combo >= 2 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[9px] font-bold text-amber-accent">
              {combo}x Combo!
            </motion.span>
          )}
          <div className={`px-2 py-1 rounded border ${timeLeft <= 10 ? 'bg-red-500/10 border-red-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
            <span className={`text-[10px] font-mono font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>{timeLeft}s</span>
          </div>
        </div>
      </div>

      <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="text-center space-y-2 py-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: `${challenge.color}15`, borderColor: `${challenge.color}30`, border: '1px solid' }}>
          <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: challenge.color }}>{challenge.sector}</span>
        </div>
        <p className="text-sm font-bold text-white">{challenge.prompt}</p>
        <p className="text-[9px] text-zinc-500 font-mono">Select the correct response:</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(opt => {
          const isCorrect = opt === challenge.correct;
          const showFeedback = feedback && isCorrect && feedback === 'correct';
          const showWrong = feedback && !isCorrect && feedback === 'wrong';
          return (
            <motion.button key={opt} onClick={() => answer(opt)} disabled={!!feedback}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
              className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                showFeedback ? 'bg-neon-green/20 border-neon-green text-neon-green' :
                showWrong ? 'bg-red-500/20 border-red-500 text-red-400' :
                'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white'
              } disabled:opacity-60`}
            >{opt}</motion.button>
          );
        })}
      </div>

      <div className="flex justify-center gap-1">
        {shuffled.current.slice(0, 8).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i < currentIdx ? 'bg-neon-green' : i === currentIdx ? 'bg-amber-accent' : 'bg-zinc-800'}`} />
        ))}
      </div>
    </div>
  );
}

const GAMES: Record<string, { component: ComponentType<GameProps>; color: string; icon: any; label: string }> = {
  'budget-allocator': { component: BudgetAllocator, color: '#F59E0B', icon: DollarSign, label: 'Budget Allocator' },
  'triage-commander': { component: TriageCommander, color: '#EF4444', icon: Heart, label: 'Triage Commander' },
  'supply-runner': { component: SupplyRunner, color: '#8B5CF6', icon: Truck, label: 'Supply Runner' },
  'risk-navigator': { component: RiskNavigator, color: '#22C55E', icon: Target, label: 'Risk Navigator' },
  'resource-rally': { component: ResourceRally, color: '#00FF66', icon: Zap, label: 'Resource Rally' },
};

export default function GameInterface({ tool }: { tool: Tool }) {
  const [gameScore, setGameScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const gameConfig = activeGame ? GAMES[activeGame] : null;
  const GameComponent = gameConfig?.component;

  const handleScore = useCallback((pts: number) => {
    setGameScore(s => s + pts);
    setTotalScore(s => s + pts);
  }, []);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
  }, []);

  const restart = () => {
    setGameScore(0);
    setGameOver(false);
    setActiveGame(null);
  };

  if (!activeGame) {
    return (
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{tool.title}</h3>
            <p className="text-[10px] text-zinc-500">{tool.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(GAMES).map(([id, game]) => {
            const Icon = game.icon;
            return (
              <motion.button key={id} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setActiveGame(id); setGameOver(false); setGameScore(0); }}
                className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 text-left transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${game.color}15`, borderColor: `${game.color}30`, border: '1px solid' }}>
                    <Icon className="w-4 h-4" strokeWidth={1.5} style={{ color: game.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">{game.label}</h4>
                    <p className="text-[9px] text-zinc-600 mt-0.5">Interactive simulation game</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: `${game.color}15`, color: game.color }}>
                    Play
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900/30">
      <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button onClick={restart} whileHover={{ x: -2 }} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Back
          </motion.button>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${gameConfig!.color}15`, border: `1px solid ${gameConfig!.color}30` }}>
            {gameConfig && <gameConfig.icon className="w-4 h-4" strokeWidth={1.5} style={{ color: gameConfig.color }} />}
          </div>
          <h4 className="text-xs font-bold text-white">{gameConfig?.label}</h4>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
            <Trophy className="w-3 h-3 text-amber-accent" strokeWidth={1.5} />
            <span className="text-[10px] font-mono font-bold text-white">{gameScore}</span>
          </div>
          {gameOver && (
            <motion.button onClick={restart} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={1.5} /> Retry
            </motion.button>
          )}
        </div>
      </div>

      {gameOver ? (
        <div className="flex-1 flex items-center justify-center p-5">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
            <Trophy className="w-12 h-12 text-amber-accent mx-auto" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-white">Game Over!</h3>
            <p className="text-3xl font-bold text-neon-green font-mono">{gameScore} pts</p>
            <p className="text-[10px] text-zinc-500 font-mono">Total session score: {totalScore}</p>
            <motion.button onClick={restart} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700 text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} /> Play Again
            </motion.button>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {GameComponent && <GameComponent onScore={handleScore} onGameOver={handleGameOver} />}
        </div>
      )}
    </div>
  );
}
