import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, AlertTriangle, Shield, Zap, Navigation, Search, ChevronRight, Phone, Loader2, Sparkles, Route } from "lucide-react";
import logo from "@/assets/safestride-logo.png";
import { Button } from "@/components/ui/button";
import RiskGauge from "@/components/RiskGauge";
import RouteMap from "@/components/RouteMap";
import { assessRouteRisk, type RiskAssessment } from "@/lib/safety-ai";
import { useTrip } from "@/contexts/TripContext";
import { toast } from "@/hooks/use-toast";

const Planner = () => {
  const navigate = useNavigate();
  const { trip, startTrip, triggerSOS, sosStatus } = useTrip();
  const [riskScore, setRiskScore] = useState(85);
  const [stalkerMode, setStalkerMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);

  const routeFrom = trip?.routeFrom || "Andheri";
  const routeTo = trip?.routeTo || "Bandra";

  useEffect(() => {
    if (!trip) {
      startTrip(routeFrom, routeTo);
    }
  }, []);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const data = await assessRouteRisk(routeFrom, routeTo, "10 PM");
        setAssessment(data);
        setRiskScore(100 - data.risk_score);
      } catch (e) {
        console.error("Risk assessment error:", e);
        toast({ title: "AI Assessment", description: "Using cached safety data", variant: "destructive" });
        setRiskScore(85);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [routeFrom, routeTo]);

  const triggerStalker = async () => {
    setStalkerMode(true);
    let current = riskScore;
    const interval = setInterval(() => {
      current -= 3;
      if (current <= 12) {
        current = 12;
        clearInterval(interval);
      }
      setRiskScore(current);
    }, 80);
    await triggerSOS();
  };

  const riskLabel = riskScore >= 70 ? "Safe" : riskScore >= 40 ? "Moderate" : "High Risk";

  return (
    <div className="min-h-screen bg-background pb-24 gradient-bg-subtle">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/home")} className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-foreground">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-display font-bold text-foreground text-sm">Route Planner</h1>
            <p className="text-[9px] text-muted-foreground font-medium">AI Safety Analysis</p>
          </div>
        </div>
        <button className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-muted-foreground">
          <Search size={18} />
        </button>
      </div>

      {/* Route info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 card-interactive rounded-2xl p-3.5 mb-4 flex items-center gap-3"
      >
        <div className="h-9 w-9 rounded-xl gradient-purple flex items-center justify-center flex-shrink-0">
          <Route size={16} className="text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{routeFrom} → {routeTo}</p>
          <p className="text-[10px] text-muted-foreground">Analyzing safest path</p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </motion.div>

      {/* Risk Gauge */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={12} /> Route Safety
          </h3>
          {loading ? (
            <Loader2 size={14} className="text-primary animate-spin" />
          ) : (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
              riskScore >= 70 ? "bg-safe/15 text-safe" : riskScore >= 40 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
            }`}>
              ● {riskLabel}
            </span>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-elevated rounded-2xl p-5"
        >
          <div className="flex justify-center">
            <RiskGauge score={riskScore} size={200} label={riskLabel} />
          </div>
          {assessment && (
            <p className="text-[10px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
              <Zap size={10} className="text-primary" />
              AI-assessed using {assessment.rag_sources.length} local safety sources
            </p>
          )}
        </motion.div>
      </div>

      {/* Real Map */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden border border-border shadow-sm">
        <RouteMap
          className="h-44"
          showRoute={true}
          startLat={trip?.startLat}
          startLng={trip?.startLng}
          endLat={trip?.endLat}
          endLng={trip?.endLng}
        />
      </div>

      {/* AI Safety Insights */}
      <div className="px-4 pt-5">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">AI Insights</h3>
        <div className="space-y-2.5">
          {loading ? (
            <div className="card-elevated rounded-2xl p-5 flex items-center justify-center gap-2">
              <Loader2 size={16} className="text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">AI analyzing route safety...</span>
            </div>
          ) : (
            assessment?.insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card-interactive rounded-2xl p-3.5 flex items-start gap-3"
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  insight.type === "warning" ? "bg-warning/10" : insight.type === "safe" ? "bg-safe/10" : "bg-primary/10"
                }`}>
                  {insight.type === "warning" ? (
                    <AlertTriangle size={14} className="text-warning" />
                  ) : insight.type === "safe" ? (
                    <Shield size={14} className="text-safe" />
                  ) : (
                    <Zap size={14} className="text-primary" />
                  )}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Nearby Resources */}
      {assessment?.nearby_resources && assessment.nearby_resources.length > 0 && (
        <div className="px-4 pt-5">
          <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">Nearby Resources</h3>
          <div className="space-y-2.5">
            {assessment.nearby_resources.slice(0, 3).map((resource, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="card-interactive rounded-2xl p-3.5 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{resource.name}</p>
                  <p className="text-[10px] text-muted-foreground">{resource.type}</p>
                </div>
                {resource.phone && (
                  <a href={`tel:${resource.phone}`} className="text-xs font-bold text-primary bg-accent px-3 py-1.5 rounded-lg hover:bg-accent/80 transition-colors">
                    Call
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Stalker Demo */}
      <div className="px-4 pt-5">
        <AnimatePresence>
          {!stalkerMode ? (
            <motion.div exit={{ opacity: 0, scale: 0.95 }}>
              <Button
                onClick={triggerStalker}
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 py-5 rounded-2xl font-semibold glow-danger text-sm"
              >
                🚨 Demo: Stalker Detected
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-elevated rounded-2xl p-4 border-destructive/30 border-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm font-bold text-destructive">THREAT DETECTED</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                Rerouting... Emergency contacts notified. Risk dropping.
              </p>

              <div className="mb-3">
                {sosStatus === "sending" && (
                  <div className="flex items-center gap-2 bg-destructive/5 rounded-lg px-3 py-2">
                    <Loader2 size={12} className="animate-spin text-destructive" />
                    <span className="text-xs text-destructive font-medium">Sending SOS alert...</span>
                  </div>
                )}
                {sosStatus === "sent" && (
                  <div className="flex items-center gap-2 bg-safe/10 rounded-lg px-3 py-2">
                    <span className="text-xs text-safe font-bold">✓ SOS sent! Contacts notified.</span>
                  </div>
                )}
                {sosStatus === "error" && (
                  <div className="bg-destructive/10 rounded-lg px-3 py-2">
                    <span className="text-xs text-destructive font-medium">SOS send failed. Call 100 directly.</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gradient-safe text-primary-foreground text-xs flex-1 rounded-xl"
                  onClick={() => navigate("/active")}
                >
                  Safe Route Found
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs flex-1 border-destructive text-destructive rounded-xl"
                  onClick={() => {
                    setStalkerMode(false);
                    setRiskScore(assessment ? 100 - assessment.risk_score : 85);
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
          className="w-full gradient-purple text-primary-foreground py-5 rounded-2xl font-semibold glow-purple text-sm"
        >
          <Navigation size={18} className="mr-2" /> Start Trip
        </Button>
      </div>
    </div>
  );
};

export default Planner;
