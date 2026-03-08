import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, AlertTriangle, Shield, Zap, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import RiskGauge from "@/components/RiskGauge";

const insights = [
  { icon: AlertTriangle, text: "Avoid 13th Cross Alley", color: "text-warning" },
  { icon: Shield, text: "Toke Ride Safe Road", color: "text-safe" },
  { icon: Zap, text: "SafeStride emergency helpline is standing by", color: "text-primary" },
];

const Planner = () => {
  const navigate = useNavigate();
  const [riskScore, setRiskScore] = useState(85);
  const [stalkerMode, setStalkerMode] = useState(false);

  const triggerStalker = () => {
    setStalkerMode(true);
    // Animate risk drop from 85 to 12
    let current = 85;
    const interval = setInterval(() => {
      current -= 3;
      if (current <= 12) {
        current = 12;
        clearInterval(interval);
      }
      setRiskScore(current);
    }, 80);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate("/home")} className="text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-bold text-foreground">SafeStride Planner</h1>
      </div>

      {/* Route info */}
      <div className="mx-4 glass-card rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <MapPin size={14} className="text-primary" />
          <span>Metro Andheri to Bandra, 10PM solo</span>
        </div>
      </div>

      {/* Risk Gauge */}
      <div className="flex flex-col items-center">
        <p className="text-xs text-muted-foreground mb-1">ROUTE SAFETY SCORE</p>
        <RiskGauge
          score={riskScore}
          label={riskScore >= 70 ? "Safe" : riskScore >= 40 ? "Moderate" : "High Risk"}
        />
      </div>

      {/* Map placeholder */}
      <div className="mx-4 mt-4 rounded-xl overflow-hidden border border-border h-40 relative bg-secondary">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Navigation size={24} className="text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Route Map Preview</p>
            <p className="text-[10px] text-muted-foreground">Andheri → Bandra West</p>
          </div>
        </div>
        {/* Simulated route line */}
        <svg className="absolute inset-0 w-full h-full">
          <motion.path
            d="M 30 120 Q 80 40 150 80 Q 220 120 300 30"
            fill="none"
            stroke="hsl(270, 85%, 58%)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* AI Safety Insights */}
      <div className="px-4 pt-4">
        <h3 className="text-xs font-semibold text-primary flex items-center gap-1 mb-2">
          <Zap size={12} /> AI Safety Insight
        </h3>
        <div className="space-y-2">
          {insights.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="glass-card rounded-lg p-2.5 flex items-center gap-2"
            >
              <item.icon size={14} className={item.color} />
              <span className="text-xs text-foreground">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stalker Demo Button */}
      <div className="px-4 pt-4">
        <AnimatePresence>
          {!stalkerMode ? (
            <motion.div exit={{ opacity: 0 }}>
              <Button
                onClick={triggerStalker}
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 py-5 rounded-xl font-semibold glow-danger"
              >
                🚨 Demo: Stalker Detected
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-xl p-4 border border-destructive/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm font-semibold text-destructive">THREAT DETECTED</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Rerouting... Emergency contacts notified. Risk dropping.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gradient-safe text-accent-foreground text-xs flex-1"
                  onClick={() => navigate("/active")}
                >
                  Safe Route Found
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs flex-1 border-destructive text-destructive"
                  onClick={() => {
                    setStalkerMode(false);
                    setRiskScore(85);
                  }}
                >
                  Reset Demo
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Start Trip */}
      <div className="px-4 pt-4">
        <Button
          onClick={() => navigate("/active")}
          className="w-full gradient-purple text-primary-foreground py-5 rounded-xl font-semibold glow-purple"
        >
          <Navigation size={18} className="mr-2" /> Start Trip
        </Button>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-3 px-4 pt-3">
        <Button
          variant="outline"
          className="flex-1 border-border text-foreground"
          onClick={() => navigate("/active")}
        >
          Share Live
        </Button>
        <Button
          className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          SOS Help
        </Button>
      </div>
    </div>
  );
};

export default Planner;
