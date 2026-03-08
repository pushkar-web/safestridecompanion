import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Star, AlertTriangle, BookOpen, Share2, Smile, Meh, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";

const Debrief = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate("/home")} className="text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-bold text-foreground">Post-Trip Debrief</h1>
      </div>

      {/* Stats */}
      <div className="flex gap-3 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 glass-card rounded-xl p-4 text-center"
        >
          <AlertTriangle size={20} className="text-warning mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-foreground">3</p>
          <p className="text-[10px] text-muted-foreground">Risks Averted</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 glass-card rounded-xl p-4 text-center"
        >
          <Shield size={20} className="text-safe mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-foreground">1.2k</p>
          <p className="text-[10px] text-muted-foreground">Safe Steps</p>
        </motion.div>
      </div>

      <div className="flex gap-3 px-4 pt-3">
        <div className="flex-1 glass-card rounded-xl p-2 text-center">
          <p className="text-xs text-safe font-semibold">+100% SAFETY</p>
          <p className="text-[10px] text-muted-foreground">SCORE</p>
        </div>
        <div className="flex-1 glass-card rounded-xl p-2 text-center">
          <p className="text-xs text-primary font-semibold">✓ VERIFIED PATH</p>
          <p className="text-[10px] text-muted-foreground">STATUS</p>
        </div>
      </div>

      {/* Trip Insights */}
      <div className="px-4 pt-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Trip Insights</h3>
        <div className="flex gap-2 mb-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-16 rounded-lg bg-secondary" />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 px-2 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-[10px] text-primary font-bold">SECURE ROUTE</span>
            </div>
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            Safe path to ML Mumbai hackathon
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            You stayed on the recommended route throughout your journey. No high-risk zones were detected.
          </p>
        </motion.div>
      </div>

      {/* Know Your Rights */}
      <div className="px-4 pt-5">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <BookOpen size={14} className="text-primary" /> Know Your Rights
        </h3>
        <div className="glass-card rounded-xl p-3">
          <p className="text-xs text-muted-foreground">
            Protection against assault or criminal force to woman with intent to outrage modesty. This is a
            cognizable offence. Call emergency services (IPC 354).
          </p>
        </div>
      </div>

      {/* QR Code / Badge */}
      <div className="flex flex-col items-center pt-5">
        <div className="h-24 w-24 rounded-xl bg-secondary border border-border flex items-center justify-center">
          <div className="grid grid-cols-4 gap-0.5">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-sm ${Math.random() > 0.4 ? "bg-foreground" : "bg-transparent"}`}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Share this badge with your emergency contacts</p>
      </div>

      {/* Share button */}
      <div className="px-4 pt-4">
        <Button className="w-full gradient-safe text-accent-foreground py-5 rounded-xl font-semibold glow-safe">
          <Share2 size={16} className="mr-2" /> Share Safety Achievement
        </Button>
      </div>

      {/* Feedback */}
      <div className="text-center pt-5">
        <p className="text-sm text-foreground mb-3">How safe did you feel?</p>
        <div className="flex justify-center gap-4">
          <button className="h-10 w-10 rounded-full glass-card flex items-center justify-center">
            <Smile size={20} className="text-safe" />
          </button>
          <button className="h-10 w-10 rounded-full glass-card flex items-center justify-center">
            <Meh size={20} className="text-warning" />
          </button>
          <button className="h-10 w-10 rounded-full glass-card flex items-center justify-center">
            <Frown size={20} className="text-destructive" />
          </button>
        </div>
      </div>

      {/* Bottom nav for this page */}
      <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-border/40">
        <div className="flex justify-around py-3 max-w-md mx-auto">
          <button onClick={() => navigate("/home")} className="text-xs text-muted-foreground flex flex-col items-center gap-1">
            <Shield size={18} /> Home
          </button>
          <button className="text-xs text-primary flex flex-col items-center gap-1">
            <BookOpen size={18} /> Routes
          </button>
          <button className="text-xs text-muted-foreground flex flex-col items-center gap-1">
            <AlertTriangle size={18} /> Alerts
          </button>
          <button onClick={() => navigate("/settings")} className="text-xs text-muted-foreground flex flex-col items-center gap-1">
            <Star size={18} /> Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Debrief;
