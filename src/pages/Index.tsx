import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/onboarding"), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="h-24 w-24 rounded-2xl gradient-purple flex items-center justify-center glow-purple"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Shield size={48} className="text-primary-foreground" />
        </motion.div>
        <h1 className="text-3xl font-display font-bold text-gradient-purple">SafeStride</h1>
        <p className="text-sm text-muted-foreground">Your safety companion</p>
      </motion.div>
    </div>
  );
};

export default Index;
