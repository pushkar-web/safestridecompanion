import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, AlertTriangle, Shield, Zap, Navigation, Search, ChevronRight } from "lucide-react";
import RouteMap from "@/components/RouteMap";
import { Button } from "@/components/ui/button";
import RiskGauge from "@/components/RiskGauge";

const Planner = () => {
  const navigate = useNavigate();
  const [riskScore, setRiskScore] = useState(85);
  const [stalkerMode, setStalkerMode] = useState(false);

  const triggerStalker = () => {
    setStalkerMode(true);
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/home")} className="text-foreground">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-1.5">
            <Shield className="text-primary" size={18} />
            <span className="font-display font-bold text-foreground">SafeStride</span>
          </div>
        </div>
        <button className="text-muted-foreground">
          <Search size={20} />
        </button>
      </div>

      {/* Route info */}
      <div className="mx-4 card-elevated rounded-xl p-3 mb-4 flex items-center gap-2">
        <MapPin size={16} className="text-primary flex-shrink-0" />
        <span className="text-sm text-foreground">Central Station via Midtown</span>
        <ChevronRight size={14} className="text-muted-foreground ml-auto" />
      </div>

      {/* Route Safety Header + Risk Gauge */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-primary">Route Safety</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            riskScore >= 70 ? "bg-safe/15 text-safe" : riskScore >= 40 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
          }`}>
            {riskScore >= 70 ? "● High" : riskScore >= 40 ? "● Medium" : "● Low"}
          </span>
        </div>
        <div className="card-elevated rounded-xl p-4">
          <p className="text-xs text-muted-foreground text-center mb-1">RISK SCORE GAUGE</p>
          <div className="flex justify-center">
            <RiskGauge score={riskScore} size={200} label={`${riskScore >= 70 ? "Safe" : riskScore >= 40 ? "Moderate" : "High Risk"}`} />
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1">
            Statistically safer than 80% of alternate routes
          </p>
        </div>
      </div>

      {/* Real Map */}
      <div className="mx-4 mt-4 rounded-xl overflow-hidden border border-border">
        <RouteMap className="h-44" showRoute={true} />
      </div>

      {/* AI Safety Insights */}
      <div className="px-4 pt-4">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card-elevated rounded-xl p-3 flex items-center gap-3"
          >
            <AlertTriangle size={16} className="text-warning flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-foreground">Avoid 12th Cross Alley</p>
              <p className="text-xs text-muted-foreground">Incidents nearby, take Main Link Road</p>
            </div>
            <span className="text-xs font-bold text-safe">+87% safety</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="card-elevated rounded-xl p-3 flex items-center gap-3"
          >
            <Zap size={16} className="text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-foreground">Fast ahead quiet. Detour now?</p>
              <p className="text-xs text-muted-foreground">Alternative route available</p>
            </div>
          </motion.div>
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
              className="card-elevated rounded-xl p-4 border-destructive/30 border"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm font-semibold text-destructive">THREAT DETECTED</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Rerouting... Emergency contacts notified. Risk dropping.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gradient-safe text-primary-foreground text-xs flex-1"
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
    </div>
  );
};

export default Planner;
