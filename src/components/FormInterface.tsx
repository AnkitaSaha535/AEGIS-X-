import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, Bot } from 'lucide-react';
import { analyzeWithAI } from '../services/ai';
import type { Tool } from '../types';

const EASING = [0.16, 1, 0.3, 1] as const;

export default function FormInterface({ tool }: { tool: Tool }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    const allFilled = tool.formFields.every(f => formData[f.id]?.trim());
    if (!allFilled) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setError(null);

    try {
      const dataSummary = tool.formFields.map(f => `${f.label}: ${formData[f.id]}`).join('\n');
      const response = await analyzeWithAI(dataSummary, tool.formFields[0]?.aiContext || 'data', tool.aiSystemPrompt);
      setResult(response);
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/30">
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
        {tool.formFields.map(field => (
          <div key={field.id} className="space-y-1.5">
            <label htmlFor={field.id} className="block text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-500">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.id}
                rows={4}
                value={formData[field.id] || ''}
                onChange={e => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                disabled={isProcessing}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-[11px] text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 focus:bg-zinc-800/80 transition-all resize-none font-mono disabled:opacity-50"
              />
            ) : (
              <input
                type="text"
                id={field.id}
                value={formData[field.id] || ''}
                onChange={e => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                disabled={isProcessing}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-[11px] text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 focus:bg-zinc-800/80 transition-all font-mono disabled:opacity-50"
              />
            )}
          </div>
        ))}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-red-400 font-mono"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={isProcessing}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50"
          style={{
            backgroundColor: `${tool.color}15`,
            borderColor: `${tool.color}30`,
            color: tool.color,
          }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
              Processing with AI...
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5" strokeWidth={1.5} />
              Analyze with AI
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-neon-green"
              />
              <div className="flex-1">
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="h-full w-1/2 rounded-full"
                    style={{ backgroundColor: tool.color }}
                  />
                </div>
              </div>
              <span className="text-[9px] font-mono text-zinc-600">AI processing</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASING }}
              className="border rounded-lg overflow-hidden"
              style={{ borderColor: `${tool.color}30` }}
            >
              <div
                className="px-4 py-2 border-b flex items-center justify-between"
                style={{ borderColor: `${tool.color}20`, backgroundColor: `${tool.color}08` }}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: tool.color }}>AI Analysis Result</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-neon-green" strokeWidth={1.5} />
              </div>
              <div className="p-4 text-[11px] font-mono text-zinc-400 leading-relaxed whitespace-pre-wrap bg-zinc-900/50">
                {result}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
