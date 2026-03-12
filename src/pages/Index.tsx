import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, MapPin } from "lucide-react";
import logo from "@/assets/safestride-logo.png";
import { useAuth } from "@/contexts/AuthContext";

const taglines = [
  "Your AI safety companion",
  "Walk with confidence",
  "Every step, protected",
];

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle taglines
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % taglines.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 100));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Navigate after splash
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      navigate(user ? "/home" : "/auth");
    }, 3200);
    return () => clearTimeout(timer);
  }, [navigate, user, loading]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background gradient layers */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 4 }}
      />

      {/* Floating orbs */}
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-primary/6 blur-[80px]"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-56 h-56 rounded-full bg-primary-glow/6 blur-[60px] translate-x-24 translate-y-20"
        animate={{
          x: [0, -40, 20, 0],
          y: [0, 30, -30, 0],
          scale: [1.1, 0.9, 1.2, 1.1],
        }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute w-40 h-40 rounded-full bg-safe/5 blur-[50px] -translate-x-32 -translate-y-20"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ repeat: Infinity, duration: 6, delay: 1 }}
      />

      {/* Particle grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3 + i * 0.5,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      <motion.div
        className="flex flex-col items-center gap-6 z-10 px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo with glow ring */}
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 12, duration: 0.8 }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute -inset-4 rounded-[2rem] border-2 border-primary/20"
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          />
          <motion.div
            className="absolute -inset-8 rounded-[2.5rem] border border-primary/10"
            animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
          />

          <motion.div
            className="h-32 w-32 rounded-3xl bg-card flex items-center justify-center shadow-2xl relative"
            style={{
              boxShadow: "0 0 60px -10px hsl(var(--primary) / 0.3), 0 20px 40px -15px hsl(var(--primary) / 0.2)",
            }}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <img src={logo} alt="SafeStride" className="h-22 w-22 object-contain" style={{ height: 88, width: 88 }} />
          </motion.div>

          {/* Sparkle badge */}
          <motion.div
            className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-accent flex items-center justify-center shadow-lg"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          >
            <Sparkles size={18} className="text-primary" />
          </motion.div>

          {/* Shield badge */}
          <motion.div
            className="absolute -bottom-2 -left-2 h-8 w-8 rounded-full bg-safe/15 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.0, type: "spring" }}
          >
            <Shield size={14} className="text-safe" />
          </motion.div>

          {/* Location badge */}
          <motion.div
            className="absolute top-1/2 -right-6 h-7 w-7 rounded-full bg-warning/15 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
          >
            <MapPin size={12} className="text-warning" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h1 className="text-4xl font-display font-bold text-gradient-purple tracking-tight">
            SafeStride
          </h1>
          <div className="h-6 mt-3 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIndex}
                className="text-sm text-muted-foreground font-medium"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {taglines[taglineIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="flex gap-2 flex-wrap justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {["AI Powered", "Real-time", "Privacy First"].map((label, i) => (
            <motion.span
              key={label}
              className="text-[10px] font-semibold px-3 py-1.5 rounded-full bg-accent text-accent-foreground"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 + i * 0.15 }}
            >
              {label}
            </motion.span>
          ))}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="w-40 h-1.5 rounded-full bg-muted overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            className="h-full rounded-full gradient-purple"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>

        <motion.p
          className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          Initializing safety systems...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Index;
