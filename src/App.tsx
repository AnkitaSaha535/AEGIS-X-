import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, ChevronRight, ArrowLeft, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { SECTORS, Sector, Tool } from './data';

function App() {
  const [view, setView] = useState<'landing' | 'grid' | 'industry' | 'sector' | 'tool'>('landing');
  const [activeSectorId, setActiveSectorId] = useState<string | null>(null);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const activeSector = SECTORS.find((s) => s.id === activeSectorId);
  const activeTool = activeSector?.tools.find((t) => t.id === activeToolId);

  const navigateToGrid = () => {
    setView('grid');
    setActiveSectorId(null);
    setActiveToolId(null);
  };

  const navigateToSector = (sectorId: string) => {
    setActiveSectorId(sectorId);
    setView('sector');
  };

  const navigateToTool = (toolId: string) => {
    setActiveToolId(toolId);
    setView('tool');
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-slate-300 font-sans selection:bg-blue-500/30 flex flex-col">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0E1014] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white hidden sm:block">ORION <span className="text-slate-500 font-light">HYBRID ORCHESTRATOR</span></h1>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-emerald-400">System Operational</span>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-[10px] uppercase font-mono tracking-widest">
            <div className="flex flex-col items-end">
              <span className="text-slate-500">CLOUD Reasoning</span>
              <span className="text-blue-400">Claude 4.5 Sonnet</span>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex flex-col items-end">
              <span className="text-slate-500">LOCAL Processing</span>
              <span className="text-purple-400">Llama 4 Scout</span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          {view === 'landing' && <LandingView key="landing" onEnter={navigateToGrid} />}
          {view === 'grid' && <GridView key="grid" onSelect={navigateToSector} onNavigateIndustry={() => setView('industry')} />}
          {view === 'industry' && <IndustryDashboardView key="industry" sectors={SECTORS} onSelect={navigateToSector} onBack={() => setView('grid')} />}
          {view === 'sector' && activeSector && (
            <SectorView 
              key="sector" 
              sector={activeSector} 
              onBack={navigateToGrid} 
              onSelectTool={navigateToTool} 
            />
          )}
          {view === 'tool' && activeSector && activeTool && (
            <ToolView 
              key="tool" 
              sector={activeSector} 
              tool={activeTool} 
              onBack={() => setView('sector')} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Views ---

function LandingView({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center flex-1 p-6 text-center relative overflow-hidden"
    >
      {/* Animated Background Orbs */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.4, 1],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Floating Sector Icons */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none hidden md:flex">
        {SECTORS.map((sector, i) => {
          const angle = (i / SECTORS.length) * Math.PI * 2;
          const radiusX = 350;
          const radiusY = 220;
          const x = Math.cos(angle) * radiusX;
          const y = Math.sin(angle) * radiusY;
          const Icon = sector.icon;
          return (
            <motion.div
              key={sector.id}
              className="absolute"
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{ 
                opacity: 1,
                x: x, 
                y: y,
                scale: 1
              }}
              transition={{ 
                x: { type: 'spring', damping: 20, stiffness: 40, delay: 0.1 * i },
                y: { type: 'spring', damping: 20, stiffness: 40, delay: 0.1 * i },
                scale: { type: 'spring', damping: 15, stiffness: 50, delay: 0.1 * i },
                opacity: { duration: 1, delay: 0.1 * i }
              }}
            >
              <motion.div
                animate={{
                  y: [-12, 12, -12],
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  y: { repeat: Infinity, duration: 4 + (i % 3), ease: "easeInOut" },
                  scale: { repeat: Infinity, duration: 3 + (i % 2), ease: "easeInOut" },
                  opacity: { repeat: Infinity, duration: 3 + (i % 2), ease: "easeInOut" }
                }}
              >
                <div className="w-14 h-14 rounded-2xl border border-white/10 bg-[#15171C]/80 backdrop-blur-xl flex items-center justify-center shadow-2xl relative transition-colors shadow-blue-500/10">
                  <div className={`absolute inset-0 rounded-2xl opacity-20 blur-md ${sector.nodeType === 'Edge' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                  <Icon className={`w-6 h-6 relative z-10 ${sector.nodeType === 'Edge' ? 'text-emerald-400' : 'text-blue-400'}`} />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div className="max-w-xl mx-auto space-y-8 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="bg-[#15171C] border border-blue-500/30 p-8 rounded-3xl inline-flex shadow-[0_0_80px_-15px_rgba(59,130,246,0.4)] relative group"
        >
          <div className="absolute inset-0 rounded-3xl bg-blue-500/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <BrainCircuit className="w-24 h-24 text-blue-400 relative z-10" strokeWidth={1.5} />
        </motion.div>
        
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-white"
          >
            Omni-Sector Intelligence Platform
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-slate-400 max-w-md mx-auto"
          >
            Harness the power of autonomous AI agents across all your operational sectors.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnter}
            className="inline-flex items-center gap-3 bg-blue-600/10 text-blue-400 border border-blue-500/30 px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-blue-600/20 hover:text-white transition-all focus:ring-4 focus:ring-blue-500/30 outline-none backdrop-blur-md"
          >
            Enter Dashboard
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function GridView({ onSelect, onNavigateIndustry }: { onSelect: (id: string) => void, onNavigateIndustry?: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-12 w-full max-w-5xl mx-auto flex-1 flex flex-col"
    >
      <div className="mb-10 flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-white">Omni-Sector Dashboard</h2>
          <p className="text-slate-500">Holistic monitoring and control of all autonomous agentic flows.</p>
        </div>
        {onNavigateIndustry && (
          <button 
            onClick={onNavigateIndustry}
            className="hidden md:inline-flex items-center gap-2 bg-blue-600/10 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-blue-600/20 hover:text-white transition-colors focus:ring-2 focus:ring-blue-500/30 outline-none"
          >
            Industry View
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTORS.map((sector, idx) => (
          <SectorCard 
            key={sector.id} 
            sector={sector} 
            delay={idx * 0.05} 
            onClick={() => onSelect(sector.id)} 
          />
        ))}
      </div>
    </motion.div>
  );
}

function IndustryDashboardView({ sectors, onSelect, onBack }: { sectors: Sector[], onSelect: (id: string) => void, onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-12 w-full max-w-5xl mx-auto flex-1 flex flex-col"
    >
      <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-8 self-start group font-bold tracking-widest text-[10px] uppercase">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="mb-10 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Industry Directory</h2>
        <p className="text-slate-500">Specialized agentic sectors and industrial flows.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sectors.map((sector, idx) => (
          <SectorCard 
            key={sector.id} 
            sector={sector} 
            delay={idx * 0.05} 
            onClick={() => onSelect(sector.id)} 
          />
        ))}
      </div>
    </motion.div>
  );
}

function SectorView({ sector, onBack, onSelectTool }: { sector: Sector, onBack: () => void, onSelectTool: (id: string) => void }) {
  const Icon = sector.icon;
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 md:p-12 w-full max-w-4xl mx-auto flex-1 flex flex-col"
    >
      <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-8 self-start group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Omni-Dashboard
      </button>

      <div className="mb-10 space-y-4">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
             <Icon className="w-8 h-8" />
           </div>
           <div>
             <h2 className="text-3xl font-bold tracking-tight text-white">{sector.title}</h2>
             <div className="flex items-center gap-2 mt-1">
               <span className={`px-2 py-0.5 border rounded text-[9px] uppercase font-bold tracking-wider ${sector.nodeType === 'Edge' ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 border-blue-500/20 text-blue-300'}`}>
                  {sector.nodeType} Node
               </span>
               <span className="text-slate-600">•</span>
               <span className="text-slate-500 text-xs">{sector.subtitle}</span>
             </div>
           </div>
        </div>
        <p className="text-slate-400 max-w-2xl text-sm">{sector.description}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/10 pb-2 mb-4">Active Agent Flows</h3>
        {sector.tools.map((tool, idx) => (
          <ToolCard 
            key={tool.id} 
            tool={tool} 
            delay={idx * 0.05} 
            onClick={() => onSelectTool(tool.id)} 
          />
        ))}
      </div>
    </motion.div>
  );
}

function ToolView({ sector, tool, onBack }: { sector: Sector, tool: Tool, onBack: () => void }) {
  const Icon = tool.icon;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="p-6 md:p-12 w-full max-w-3xl mx-auto flex-1 flex flex-col"
    >
      <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-8 self-start group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to {sector.title}
      </button>

      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3 text-emerald-400 text-[10px] uppercase font-bold tracking-wider mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Agent Active
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <Icon className="w-6 h-6 text-slate-500" />
          {tool.title}
        </h2>
        <p className="text-slate-500 text-sm">{tool.description}</p>
      </div>

      <div className="flex-grow bg-[#15171C] overflow-hidden border border-white/5 rounded-xl shadow-xl">
         {tool.type === 'form' && <FormInterface tool={tool} />}
         {tool.type === 'chat' && <ChatInterface tool={tool} />}
         {tool.type === 'dashboard' && <DashboardInterface tool={tool} />}
      </div>
    </motion.div>
  );
}

// --- Reusable Components ---

function SectorCard({ sector, delay, onClick }: { sector: Sector, delay: number, onClick: () => void }) {
  const Icon = sector.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="bg-[#15171C] border border-white/5 p-6 rounded-xl text-left hover:border-blue-500/30 transition-all group focus:ring-2 focus:ring-blue-500 outline-none flex flex-col relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
           <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[9px] uppercase font-bold text-emerald-400 tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Agent Active
        </div>
      </div>
      <h3 className="text-xl font-bold tracking-tight mb-2 text-white">{sector.title}</h3>
      <p className="text-slate-500 text-xs mt-1 line-clamp-2">{sector.subtitle}</p>
    </motion.button>
  );
}

function ToolCard({ tool, delay, onClick }: { tool: Tool, delay: number, onClick: () => void }) {
  const Icon = tool.icon;
  return (
    <motion.button
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="w-full bg-[#15171C] border border-white/5 p-5 rounded-xl text-left hover:border-blue-500/30 transition-all group flex items-center justify-between relative overflow-hidden"
    >
      <div className="flex items-center gap-5">
        <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
           <Icon className="w-5 h-5 transition-colors" />
        </div>
        <div>
          <h4 className="font-bold text-white transition-colors">{tool.title}</h4>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 pr-4">{tool.description}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 shrink-0 transform group-hover:translate-x-1 transition-all" />
    </motion.button>
  );
}

// --- Specific Interfaces ---

function FormInterface({ tool }: { tool: Tool }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [broadcastProgress, setBroadcastProgress] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setResult(null);
    setBroadcastProgress(0);

    if (tool.id === 'alert-broadcaster') {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 20) + 5;
        if (currentProgress >= 100) {
          clearInterval(interval);
          setBroadcastProgress(100);
          setIsProcessing(false);
          setResult('Alert dispatched to ' + (Math.floor(Math.random() * 5000) + 12000).toLocaleString() + ' devices in targeted zone. Handshake initiated with Logistics sector for support.');
        } else {
          setBroadcastProgress(currentProgress);
        }
      }, 300);
      return;
    }

    // Simulate orchestration delay
    setTimeout(() => {
      setIsProcessing(false);
      setResult(tool.mockResultText || 'Processing complete.');
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full bg-[#0E1014]/50">
      <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-grow overflow-y-auto">
        {tool.formFields?.map(field => (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea 
                id={field.id}
                rows={4}
                required
                className="w-full bg-black/20 border border-white/5 rounded p-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none transition-all font-mono"
                placeholder={field.placeholder}
              />
            ) : field.type === 'file' ? (
              <div className="w-full border border-dashed border-white/10 rounded p-6 flex justify-center items-center hover:border-blue-500/30 transition-colors bg-black/20 cursor-pointer">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Choose File or Drag & Drop</span>
              </div>
            ) : (
              <input 
                type="text"
                id={field.id}
                required
                className="w-full bg-black/20 border border-white/5 rounded p-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}

        <div className="pt-4 border-t border-white/5 space-y-4">
          <button 
            type="submit"
            disabled={isProcessing}
            className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold uppercase tracking-widest text-[10px] py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-12"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : tool.mockActionLabel || 'Execute'}
          </button>
          {tool.id === 'alert-broadcaster' && isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                <span>Dispatching Nodes</span>
                <span>{broadcastProgress}%</span>
              </div>
              <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-300 ease-out"
                  style={{ width: `${broadcastProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 border border-white/5 bg-black/40 rounded overflow-hidden"
            >
              <div className="bg-black/60 px-4 py-2 text-[10px] font-mono text-slate-500 border-b border-white/5 flex justify-between items-center tracking-widest uppercase">
                <span>VERIFIED_OUTPUT</span>
                <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Local Consensus Reached</span>
              </div>
              <div className="p-4 text-[10px] font-mono text-blue-400/80 whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

function ChatInterface({ tool }: { tool: Tool }) {
  const [messages, setMessages] = useState<{role: 'user'|'agent', content: string}[]>([
    { role: 'agent', content: `Security protocol active. ${tool.title} is ready for input. How can I assist you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'agent', content: "Request acknowledged. Interpreting parameters through sector guidelines. This is a simulated response indicating the agent has processed the input and is evaluating state." }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#0E1014]/50">
      <div className="flex-grow p-6 overflow-y-auto space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[80%] rounded p-4 text-[10px] font-mono leading-relaxed ${m.role === 'user' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'bg-black/40 border border-white/5 text-slate-300'}`}>
               {m.content}
             </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-black/40 border border-white/5 rounded p-4 text-slate-500 flex items-center gap-1.5 h-12">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0ms' }} />
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '150ms' }} />
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '300ms' }} />
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/5 bg-[#15171C]">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Initialize query sequence..."
            className="w-full bg-black/40 border border-white/5 rounded pl-4 pr-12 py-3 text-[10px] font-mono text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-1.5 text-blue-400 hover:text-white disabled:opacity-50 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function DashboardInterface({ tool }: { tool: Tool }) {
  // A generic mock dashboard view
  return (
    <div className="p-6 h-[400px] flex items-center justify-center bg-[#0E1014]/50">
      <div className="text-center space-y-6">
        <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 border border-white/10 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-2 border border-blue-500/30 rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
            <div className="p-6 bg-blue-500/10 rounded-full border border-blue-500/20 relative z-10">
               {React.createElement(tool.icon, { className: "w-10 h-10 text-blue-400" })}
            </div>
        </div>
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Live Telemetry Active</h4>
          <p className="text-[10px] font-mono text-slate-500 max-w-xs mx-auto mt-2">Graph connected. Waiting for stream data visualization layer to mount.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
