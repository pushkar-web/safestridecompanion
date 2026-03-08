import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, AlertTriangle, Navigation, Phone, Shield, Clock, Heart, Search, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RouteMap from "@/components/RouteMap";

const ActiveTrip = () => {
  const navigate = useNavigate();
  const [bpm, setBpm] = useState(72);
  const [riskLevel, setRiskLevel] = useState(15);
  const [elapsed, setElapsed] = useState(0);
  const [alert, setAlert] = useState<string | null>(null);
  const [sosSlide, setSosSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    const bpmInterval = setInterval(() => setBpm(Math.floor(Math.random() * 15 + 68)), 3000);

    const alertTimeout = setTimeout(() => {
      setAlert("Unusual Stop Detected");
      setRiskLevel(42);
      setTimeout(() => {
        setAlert(null);
        setRiskLevel(15);
      }, 5000);
    }, 6000);

    return () => {
      clearInterval(timer);
      clearInterval(bpmInterval);
      clearTimeout(alertTimeout);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/debrief")} className="text-foreground">
            <X size={20} />
          </button>
          <div>
            <h1 className="text-base font-display font-bold text-foreground">Active Trip</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Duration: {formatTime(elapsed)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 px-2 rounded-full bg-safe/15 flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-safe animate-pulse" />
            <span className="text-[10px] text-safe font-semibold">Live</span>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-3">
        <div className="card-elevated rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Search size={14} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search safe havens...</span>
        </div>
      </div>

      {/* Real Map */}
      <div className="mx-4 rounded-xl overflow-hidden border border-border">
        <RouteMap className="h-48" showRoute={true} animateMarker={true} />
      </div>

      {/* Risk Level + Stats */}
      <div className="mx-4 mt-4 card-elevated rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk Level</p>
            <p className="text-lg font-display font-bold text-foreground">
              {riskLevel <= 30 ? "Minimal Risk" : "Elevated"}
            </p>
          </div>
          <div className="text-right">
            <motion.span
              className={`text-2xl font-display font-bold ${riskLevel <= 30 ? "text-safe" : "text-warning"}`}
              key={riskLevel}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {riskLevel}
            </motion.span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-destructive" />
            <div>
              <p className="text-sm font-bold text-foreground">{bpm}</p>
              <p className="text-[10px] text-muted-foreground">BPM</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-safe" />
            <div>
              <p className="text-sm font-bold text-safe">Active</p>
              <p className="text-[10px] text-muted-foreground">Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mx-4 mt-3 card-elevated rounded-xl p-3 border-destructive/30 border"
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-destructive" />
            <span className="text-sm font-semibold text-destructive">{alert}</span>
          </div>
          <p className="text-xs text-muted-foreground">Are you okay? Select a quick action below.</p>
          <div className="mt-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Actions Needed</p>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              Trigger "Fake Call" Player <ChevronRight size={12} />
            </button>
          </div>
        </motion.div>
      )}

      {/* SOS Slider */}
      <div className="px-4 pt-4">
        <div className="relative h-14 rounded-full bg-destructive/10 border border-destructive/30 overflow-hidden flex items-center">
          <motion.div
            className="absolute left-1 h-12 w-12 rounded-full bg-destructive flex items-center justify-center cursor-grab"
            drag="x"
            dragConstraints={{ left: 0, right: 250 }}
            dragElastic={0}
            onDragEnd={(_, info) => {
              if (info.offset.x > 200) {
                // SOS triggered
              }
            }}
          >
            <Phone size={20} className="text-destructive-foreground" />
          </motion.div>
          <span className="w-full text-center text-sm font-semibold text-destructive">
            SLIDE TO SOS →→→
          </span>
        </div>
      </div>

      {/* End Trip */}
      <div className="px-4 pt-3">
        <Button
          onClick={() => navigate("/debrief")}
          variant="outline"
          className="w-full border-primary text-primary py-4 rounded-xl"
        >
          <Shield size={16} className="mr-2" /> End Trip Safely
        </Button>
      </div>
    </div>
  );
};

export default ActiveTrip;
