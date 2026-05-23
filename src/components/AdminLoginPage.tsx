import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ChevronLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';

const EASING = [0.16, 1, 0.3, 1] as const;

export default function AdminLoginPage({
  onBack,
  onLogin,
  onGoogleLogin,
}: {
  onBack: () => void;
  onLogin: (username: string, password: string) => boolean;
  onGoogleLogin: (name: string, email: string, photo: string) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError('');
    setTimeout(() => {
      const name = 'Alex Chen';
      const email = 'alex.chen@gmail.com';
      const photo = `https://ui-avatars.com/api/?name=Alex+Chen&background=ef4444&color=fff&size=128`;
      onGoogleLogin(name, email, photo);
      setGoogleLoading(false);
    }, 1200);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    const success = onLogin(username.trim(), password);
    if (!success) setError('Invalid credentials. Try admin / admin123.');
  };

  return (
    <div className="fixed inset-0 bg-midnight-950 text-zinc-300 font-sans antialiased flex flex-col">
      <header className="h-16 flex items-center px-8 border-b border-zinc-800/50">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-xs font-mono">Back</span>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono text-zinc-600">Admin Access</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASING }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7 text-red-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Admin Login</h2>
            <p className="text-xs text-zinc-500">Sign in with Google or use admin credentials</p>
          </div>

          <motion.button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-white/5 border border-zinc-700 text-zinc-300 text-xs font-medium hover:bg-white/10 hover:border-zinc-600 transition-all disabled:opacity-60"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Opening Google...' : 'Sign in with Google'}
          </motion.button>

          <div className="relative flex items-center gap-3 py-2">
            <div className="flex-1 border-t border-zinc-800" />
            <span className="text-[9px] font-mono text-zinc-600">OR</span>
            <div className="flex-1 border-t border-zinc-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-700 outline-none transition-colors focus:border-red-500/50"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-white placeholder-zinc-700 outline-none transition-colors focus:border-red-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-[10px]"
              >
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors"
            >
              Authenticate as Admin
            </motion.button>
          </form>

          <p className="text-center text-[9px] font-mono text-zinc-700">
            Demo: any username / admin123
          </p>
        </motion.div>
      </main>
    </div>
  );
}
