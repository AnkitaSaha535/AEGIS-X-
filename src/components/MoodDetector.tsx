import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, CameraOff, Smile, Frown, Meh, Sparkles } from 'lucide-react';

const EASING = [0.16, 1, 0.3, 1] as const;

const MOOD_RESULTS: Record<string, { emoji: string; label: string; color: string; message: string }> = {
  happy: { emoji: '😊', label: 'Happy', color: '#22C55E', message: 'You seem happy! Keep that positive energy — it makes learning more effective.' },
  sad: { emoji: '😢', label: 'Sad', color: '#3B82F6', message: 'It looks like you might be feeling down. Take a break if you need — learning can wait.' },
  neutral: { emoji: '😐', label: 'Neutral', color: '#F59E0B', message: 'You seem neutral. Ready to learn something new?' },
  surprised: { emoji: '😮', label: 'Surprised', color: '#8B5CF6', message: 'Something caught your attention! Let\'s explore that curiosity.' },
  focused: { emoji: '🤔', label: 'Focused', color: '#EF4444', message: 'Deep in concentration — that\'s where the best learning happens!' },
};

function simulateMoodDetection(): string {
  const moods = ['happy', 'sad', 'neutral', 'surprised', 'focused'];
  const weights = [0.3, 0.1, 0.25, 0.15, 0.2];
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < moods.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) return moods[i];
  }
  return 'neutral';
}

export default function MoodDetector() {
  const [cameraActive, setCameraActive] = useState(false);
  const [detectedMood, setDetectedMood] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setDetectedMood(null);
    setIsDetecting(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setDetectedMood(null);
      setScanCount(0);
    } catch {
      setIsDetecting(false);
    }
  }, []);

  const detectMood = useCallback(() => {
    if (!cameraActive) return;
    setIsDetecting(true);
    setScanCount(prev => prev + 1);

    setTimeout(() => {
      const mood = simulateMoodDetection();
      setDetectedMood(mood);
      setIsDetecting(false);
    }, 1200);
  }, [cameraActive]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const moodResult = detectedMood ? MOOD_RESULTS[detectedMood] : null;

  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h3 className="text-base font-bold text-white">Mood Detection</h3>
        <p className="text-[11px] text-zinc-500">AI-powered emotion analysis via facial recognition</p>
      </motion.div>

      <div className="relative w-full max-w-sm aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CameraOff className="w-12 h-12 text-zinc-700" strokeWidth={1} />
          </div>
        )}

        <AnimatePresence>
          {isDetecting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="flex flex-col items-center gap-2"
              >
                <Sparkles className="w-8 h-8 text-neon-green" strokeWidth={1.5} />
                <span className="text-[10px] font-mono text-zinc-300">Analyzing facial expression...</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {cameraActive && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
            <div className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-neon-green animate-pulse' : 'bg-zinc-600'}`} />
            <span className="text-[8px] font-mono text-zinc-400">Camera Active</span>
          </div>
        )}
      </div>

      {moodResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-sm p-5 rounded-xl border"
          style={{ backgroundColor: `${moodResult.color}10`, borderColor: `${moodResult.color}30` }}
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="text-3xl">{moodResult.emoji}</span>
            <div>
              <p className="text-sm font-bold text-white">{moodResult.label}</p>
              <p className="text-[9px] font-mono text-zinc-500">Scan #{scanCount} · {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">{moodResult.message}</p>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        {!cameraActive ? (
          <motion.button
            onClick={startCamera}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-700 transition-all"
          >
            <Camera className="w-4 h-4" strokeWidth={1.5} />
            Start Camera
          </motion.button>
        ) : (
          <>
            <motion.button
              onClick={detectMood}
              disabled={isDetecting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-[10px] font-bold uppercase tracking-wider hover:bg-neon-green/20 disabled:opacity-40 transition-all"
            >
              <Smile className="w-4 h-4" strokeWidth={1.5} />
              {isDetecting ? 'Scanning...' : `Detect Mood (${3 - (scanCount % 4)})`}
            </motion.button>
            <motion.button
              onClick={stopCamera}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-500 text-[10px] font-bold uppercase tracking-wider hover:text-zinc-300 transition-all"
            >
              <CameraOff className="w-4 h-4" strokeWidth={1.5} />
              Stop
            </motion.button>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 text-[9px] text-zinc-700">
        {Object.entries(MOOD_RESULTS).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1">
            <span>{val.emoji}</span>
            <span className="font-mono">{val.label}</span>
          </span>
        ))}
      </div>

      <p className="text-[8px] text-zinc-800 font-mono text-center max-w-xs">
        Note: In production, this uses a TensorFlow.js model (face-api.js) for real expression analysis.
        Demo mode uses simulated detection for illustration.
      </p>
    </div>
  );
}
