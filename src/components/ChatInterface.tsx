import { useState, useRef, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { chatWithAI } from '../services/ai';
import { useSecurity } from '../context/SecurityContext';
import type { Tool } from '../types';

const EASING = [0.16, 1, 0.3, 1] as const;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface({ tool }: { tool: Tool }) {
  const { addFeedback, trackToolUsage } = useSecurity();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `**${tool.title}** initialized. ${tool.description}\n\nHow can I assist you today?` },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    trackToolUsage(tool.id.split('-')[0] || 'unknown', tool.id);
  }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithAI(userMsg, history, tool.aiSystemPrompt);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing request. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const assistantMessageIndices = messages
    .map((m, i) => (m.role === 'assistant' ? i : -1))
    .filter(i => i !== -1);

  return (
    <div className="flex flex-col h-full bg-zinc-900/30">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASING }}
          >
            <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  m.role === 'user' ? 'bg-zinc-800' : 'bg-zinc-800/50 border border-zinc-700'
                }`}>
                  {m.role === 'user' ? (
                    <User className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-zinc-300" strokeWidth={1.5} />
                  )}
                </div>
                <div className={`px-3.5 py-2.5 rounded-xl text-[11px] leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-zinc-800/80 text-zinc-200 border border-zinc-700/50'
                    : 'bg-zinc-900/80 text-zinc-300 border border-zinc-800'
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
            {m.role === 'assistant' && i > 0 && (
              <FeedbackButtons
                toolId={tool.id}
                messageIndex={i}
                onFeedback={addFeedback}
              />
            )}
          </motion.div>
        ))}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-zinc-800/50 border border-zinc-700 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-zinc-300" strokeWidth={1.5} />
                </div>
                <div className="px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" strokeWidth={1.5} />
                  <span className="text-[10px] text-zinc-500 font-mono">Analyzing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-zinc-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-4 pr-12 py-2.5 text-[11px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors disabled:opacity-50"
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-1.5 p-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 disabled:opacity-40 transition-all"
          >
            <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
          </motion.button>
        </div>
      </form>
    </div>
  );
}

function FeedbackButtons({ toolId, messageIndex, onFeedback }: { toolId: string; messageIndex: number; onFeedback: (toolId: string, messageIndex: number, feedback: 'like' | 'dislike') => void }) {
  const { chatFeedback } = useSecurity();
  const existing = chatFeedback.find(f => f.toolId === toolId && f.messageIndex === messageIndex);

  return (
    <div className="flex items-center gap-1.5 pl-10 pt-1">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onFeedback(toolId, messageIndex, 'like')}
        className={`p-1 rounded transition-colors ${
          existing?.feedback === 'like'
            ? 'text-neon-green bg-neon-green/10'
            : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50'
        }`}
      >
        <ThumbsUp className="w-3 h-3" strokeWidth={1.5} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onFeedback(toolId, messageIndex, 'dislike')}
        className={`p-1 rounded transition-colors ${
          existing?.feedback === 'dislike'
            ? 'text-red-400 bg-red-500/10'
            : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50'
        }`}
      >
        <ThumbsDown className="w-3 h-3" strokeWidth={1.5} />
      </motion.button>
      {existing?.feedback === 'like' && (
        <span className="text-[8px] text-neon-green/60 font-mono">Helpful</span>
      )}
      {existing?.feedback === 'dislike' && (
        <span className="text-[8px] text-red-400/60 font-mono">Not helpful</span>
      )}
    </div>
  );
}
