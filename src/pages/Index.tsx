import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import logo from "@/assets/safestride-logo.png";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/onboarding"), 2800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background gradient-bg-hero relative overflow-hidden">
      {/* Ambient circles */}
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-primary/5 blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-primary-glow/5 blur-3xl translate-x-20 translate-y-10"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
      />

      <motion.div
        className="flex flex-col items-center gap-5 z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
      >
        {/* Logo */}
        <motion.div
          className="relative"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <motion.div
            className="h-28 w-28 rounded-3xl bg-card flex items-center justify-center glow-purple shadow-lg"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <img src={logo} alt="SafeStride" className="h-20 w-20 object-contain" />
          </motion.div>
          <motion.div
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent flex items-center justify-center"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          >
            <Sparkles size={16} className="text-primary" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-4xl font-display font-bold text-gradient-purple tracking-tight">SafeStride</h1>
          <motion.p
            className="text-sm text-muted-foreground mt-2 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Your AI safety companion
          </motion.p>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          className="w-32 h-1 rounded-full bg-muted overflow-hidden mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="h-full rounded-full gradient-purple"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 1, duration: 1.6, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
