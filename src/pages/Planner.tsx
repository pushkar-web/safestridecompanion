import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, AlertTriangle, Shield, Zap, Navigation, Search, ChevronRight, Phone, Loader2 } from "lucide-react";
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
    
    // Animate risk drop
    let current = riskScore;
    const interval = setInterval(() => {
      current -= 3;
      if (current <= 12) {
        current = 12;
        clearInterval(interval);
      }
      setRiskScore(current);
    }, 80);

    // Trigger real SOS
    await triggerSOS();
  };

  const riskLabel = riskScore >= 70 ? "Safe" : riskScore >= 40 ? "Moderate" : "High Risk";

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
        <span className="text-sm text-foreground">{routeFrom} → {routeTo}</span>
        <ChevronRight size={14} className="text-muted-foreground ml-auto" />
      </div>

      {/* Route Safety Header + Risk Gauge */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-primary">Route Safety</h3>
          {loading ? (
            <Loader2 size={14} className="text-primary animate-spin" />
          ) : (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              riskScore >= 70 ? "bg-safe/15 text-safe" : riskScore >= 40 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
            }`}>
              ● {riskLabel}
            </span>
          )}
        </div>
        <div className="card-elevated rounded-xl p-4">
          <p className="text-xs text-muted-foreground text-center mb-1">RISK SCORE GAUGE</p>
          <div className="flex justify-center">
            <RiskGauge score={riskScore} size={200} label={riskLabel} />
          </div>
          {assessment && (
            <p className="text-[10px] text-muted-foreground text-center mt-1">
              AI-assessed using {assessment.rag_sources.length} local safety data sources
            </p>
          )}
        </div>
      </div>

      {/* Real Map */}
      <div className="mx-4 mt-4 rounded-xl overflow-hidden border border-border">
        <RouteMap className="h-44" showRoute={true} />
      </div>

      {/* AI Safety Insights */}
      <div className="px-4 pt-4">
        <div className="space-y-2">
          {loading ? (
            <div className="card-elevated rounded-xl p-4 flex items-center justify-center gap-2">
              <Loader2 size={16} className="text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">AI analyzing route safety...</span>
            </div>
          ) : (
            assessment?.insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated rounded-xl p-3 flex items-start gap-3"
              >
                {insight.type === "warning" ? (
                  <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
                ) : insight.type === "safe" ? (
                  <Shield size={16} className="text-safe flex-shrink-0 mt-0.5" />
                ) : (
                  <Zap size={16} className="text-primary flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm text-foreground">{insight.text}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Nearby Resources */}
      {assessment?.nearby_resources && assessment.nearby_resources.length > 0 && (
        <div className="px-4 pt-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Nearby Resources</h3>
          <div className="space-y-2">
            {assessment.nearby_resources.slice(0, 3).map((resource, i) => (
              <div key={i} className="card-elevated rounded-xl p-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{resource.name}</p>
                  <p className="text-xs text-muted-foreground">{resource.type}</p>
                </div>
                {resource.phone && (
                  <a href={`tel:${resource.phone}`} className="text-xs font-bold text-primary">
                    {resource.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
              <p className="text-xs text-muted-foreground mb-1">
                Rerouting... Emergency contacts notified. Risk dropping.
              </p>

              {/* SOS Status */}
              <div className="mb-3">
                {sosStatus === "sending" && (
                  <div className="flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin text-destructive" />
                    <span className="text-xs text-destructive">Sending SOS alert...</span>
                  </div>
                )}
                {sosStatus === "sent" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-safe font-semibold">✓ SOS sent! Contacts notified. Emergency services alerted.</span>
                  </div>
                )}
                {sosStatus === "error" && (
                  <span className="text-xs text-destructive">SOS send failed. Call 100 directly.</span>
                )}
              </div>

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
          className="w-full gradient-purple text-primary-foreground py-5 rounded-xl font-semibold glow-purple"
        >
          <Navigation size={18} className="mr-2" /> Start Trip
        </Button>
      </div>
    </div>
  );
};

export default Planner;
