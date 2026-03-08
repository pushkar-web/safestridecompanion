import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, AlertTriangle, Phone, Shield, Heart, Search, Zap, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import RouteMap from "@/components/RouteMap";
import { useTrip } from "@/contexts/TripContext";
import { toast } from "@/hooks/use-toast";

const ActiveTrip = () => {
  const navigate = useNavigate();
  const { trip, endTrip, incrementRisks, triggerSOS, sosStatus } = useTrip();
  const [bpm, setBpm] = useState(72);
  const [riskLevel, setRiskLevel] = useState(15);
  const [elapsed, setElapsed] = useState(0);
  const [alert, setAlert] = useState<string | null>(null);
  const [fakeCallActive, setFakeCallActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    const bpmInterval = setInterval(() => setBpm(Math.floor(Math.random() * 15 + 68)), 3000);

    const alertTimeout = setTimeout(() => {
      setAlert("Unusual Stop Detected");
      setRiskLevel(42);
      incrementRisks();
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

  const handleEndTrip = async () => {
    await endTrip();
    navigate("/debrief");
  };

  const handleSOS = async () => {
    await triggerSOS();
    toast({
      title: "🚨 SOS Triggered",
      description: "Emergency contacts have been notified with your live location.",
    });
  };

  const handleFakeCall = () => {
    setFakeCallActive(true);
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
    toast({
      title: "📞 Incoming Call",
      description: "\"Mom\" is calling... (fake call activated)",
    });
    setTimeout(() => setFakeCallActive(false), 10000);
  };

  return (
    <div className="min-h-screen bg-background pb-24 relative gradient-bg-subtle">
      {/* Fake Call Overlay */}
      {fakeCallActive && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 gradient-purple p-6 text-center max-w-md mx-auto rounded-b-3xl"
        >
          <div className="floating">
            <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-widest">Incoming Call</p>
            <p className="text-primary-foreground text-2xl font-display font-bold mt-2">Mom</p>
            <p className="text-primary-foreground/50 text-xs mt-0.5">Mobile</p>
          </div>
          <div className="flex justify-center gap-8 mt-6">
            <button
              onClick={() => setFakeCallActive(false)}
              className="h-14 w-14 rounded-full bg-destructive flex items-center justify-center glow-danger"
            >
              <Phone size={22} className="text-destructive-foreground rotate-[135deg]" />
            </button>
            <button
              onClick={() => {
                setFakeCallActive(false);
                toast({ title: "Call Connected", description: "Playing pre-recorded conversation..." });
              }}
              className="h-14 w-14 rounded-full bg-safe flex items-center justify-center glow-safe"
            >
              <Phone size={22} className="text-primary-foreground" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-5">
        <div className="flex items-center gap-3">
          <button onClick={handleEndTrip} className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-foreground">
            <X size={18} />
          </button>
          <div>
            <h1 className="text-sm font-display font-bold text-foreground">Active Trip</h1>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
              Duration: {formatTime(elapsed)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 px-3 rounded-full bg-safe/15 flex items-center gap-1.5 border border-safe/20">
            <div className="h-2 w-2 rounded-full bg-safe status-dot" />
            <span className="text-[10px] text-safe font-bold">Live</span>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-3">
        <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-2.5">
          <Search size={15} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search safe havens nearby...</span>
        </div>
      </div>

      {/* Real Map */}
      <div className="mx-4 rounded-2xl overflow-hidden border border-border shadow-sm">
        <RouteMap
          className="h-48"
          showRoute={true}
          animateMarker={true}
          startLat={trip?.startLat}
          startLng={trip?.startLng}
          endLat={trip?.endLat}
          endLng={trip?.endLng}
        />
      </div>

      {/* Risk Level + Stats */}
      <div className="mx-4 mt-4 card-elevated rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Risk Level</p>
            <p className="text-base font-display font-bold text-foreground mt-0.5">
              {riskLevel <= 30 ? "Minimal Risk" : "Elevated"}
            </p>
          </div>
          <div className="text-right">
            <motion.div
              className={`flex items-baseline gap-0.5 ${riskLevel <= 30 ? "text-safe" : "text-warning"}`}
              key={riskLevel}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <span className="text-3xl font-display font-bold">{riskLevel}</span>
              <span className="text-sm text-muted-foreground font-medium">/100</span>
            </motion.div>
          </div>
        </div>

        <div className="flex gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Heart size={14} className="text-destructive" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{bpm}</p>
              <p className="text-[9px] text-muted-foreground font-medium">BPM</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-safe/10 flex items-center justify-center">
              <Zap size={14} className="text-safe" />
            </div>
            <div>
              <p className="text-sm font-bold text-safe">Active</p>
              <p className="text-[9px] text-muted-foreground font-medium">Status</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 ml-auto">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{trip?.routeFrom?.slice(0, 4) || "—"}</p>
              <p className="text-[9px] text-muted-foreground font-medium">Area</p>
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
          className="mx-4 mt-3 card-elevated rounded-2xl p-4 border-destructive/30 border-2"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle size={14} className="text-destructive" />
            </div>
            <span className="text-sm font-bold text-destructive">{alert}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Are you okay? Select a quick action below.</p>
          <div className="flex gap-2">
            <button
              onClick={handleFakeCall}
              className="text-xs text-primary font-semibold flex items-center gap-1.5 glass-card rounded-xl px-4 py-2.5 flex-1 justify-center"
            >
              📞 Fake Call
            </button>
            <button
              onClick={handleSOS}
              className="text-xs text-destructive font-semibold flex items-center gap-1.5 bg-destructive/10 rounded-xl px-4 py-2.5 flex-1 justify-center border border-destructive/20"
            >
              🚨 SOS Alert
            </button>
          </div>
        </motion.div>
      )}

      {/* SOS Slider */}
      <div className="px-4 pt-4">
        <div className="relative h-14 rounded-full bg-destructive/10 border-2 border-destructive/25 overflow-hidden flex items-center">
          <motion.div
            className="absolute left-1 h-12 w-12 rounded-full bg-destructive flex items-center justify-center cursor-grab z-10 glow-danger"
            drag="x"
            dragConstraints={{ left: 0, right: 250 }}
            dragElastic={0}
            onDragEnd={(_, info) => {
              if (info.offset.x > 200) {
                handleSOS();
              }
            }}
          >
            <Phone size={20} className="text-destructive-foreground" />
          </motion.div>
          <span className="w-full text-center text-sm font-bold text-destructive">
            {sosStatus === "sending" ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Sending SOS...
              </span>
            ) : sosStatus === "sent" ? "✓ SOS Sent!" : "SLIDE TO SOS →→→"}
          </span>
        </div>
      </div>

      {/* End Trip */}
      <div className="px-4 pt-3">
        <Button
          onClick={handleEndTrip}
          variant="outline"
          className="w-full border-primary/30 text-primary py-4 rounded-2xl font-semibold hover:bg-accent"
        >
          <Shield size={16} className="mr-2" /> End Trip Safely
        </Button>
      </div>
    </div>
  );
};

export default ActiveTrip;
