import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, AlertTriangle, Navigation, Share2, Phone, Shield, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ActiveTrip = () => {
  const navigate = useNavigate();
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [alert, setAlert] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState("SAFE");

  useEffect(() => {
    // Simulate movement
    const si = setInterval(() => {
      setSpeed(Math.floor(Math.random() * 20 + 5));
      setDistance((d) => +(d + 0.05).toFixed(2));
    }, 2000);

    // Simulate alert
    const at = setTimeout(() => {
      setAlert("Anomaly Detected!");
      setRideStatus("ALERT");
      setTimeout(() => {
        setAlert(null);
        setRideStatus("SAFE");
      }, 4000);
    }, 5000);

    return () => {
      clearInterval(si);
      clearTimeout(at);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Map area */}
      <div className="relative h-[55vh] bg-secondary overflow-hidden">
        {/* Simulated map with grid */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="border-b border-border/30" style={{ height: '5%' }} />
          ))}
        </div>
        <svg className="absolute inset-0 w-full h-full">
          <motion.path
            d="M 40 350 Q 100 200 200 250 Q 300 300 350 100"
            fill="none"
            stroke="hsl(270, 85%, 58%)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
          />
          <motion.circle
            cx="200"
            cy="250"
            r="8"
            fill="hsl(270, 85%, 58%)"
            animate={{ cx: [40, 100, 200, 300, 350], cy: [350, 200, 250, 300, 100] }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
          />
        </svg>

        {/* Close button */}
        <button
          onClick={() => navigate("/debrief")}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center"
        >
          <X size={16} className="text-foreground" />
        </button>

        {/* Alert overlay */}
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-4 right-12 z-10"
          >
            <div className="bg-destructive/90 rounded-xl p-3 flex items-center gap-2 glow-danger">
              <AlertTriangle size={18} className="text-destructive-foreground" />
              <span className="text-sm font-semibold text-destructive-foreground">{alert}</span>
            </div>
          </motion.div>
        )}

        {/* Video/recording indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="h-6 px-2 rounded-full bg-background/80 flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-[10px] text-foreground">LIVE</span>
          </div>
        </div>
      </div>

      {/* Trip info panel */}
      <div className="mx-4 -mt-6 relative z-10 glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${rideStatus === "SAFE" ? "bg-safe" : "bg-destructive"} animate-pulse`} />
            <span className={`text-xs font-semibold ${rideStatus === "SAFE" ? "text-safe" : "text-destructive"}`}>
              RIDE STATUS: {rideStatus}
            </span>
          </div>
          <Volume2 size={16} className="text-muted-foreground" />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{speed}</p>
            <p className="text-[10px] text-muted-foreground">KM/H</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{distance}</p>
            <p className="text-[10px] text-muted-foreground">KM</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-display font-bold text-foreground">112</p>
            <p className="text-[10px] text-muted-foreground">BPM</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <p className="text-lg font-display font-bold text-safe">Quiet</p>
            <p className="text-[10px] text-muted-foreground">AREA</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 px-4 pt-4">
        <Button
          variant="outline"
          className="flex-1 border-border text-foreground py-5"
        >
          <Share2 size={16} className="mr-1" /> Share Live
        </Button>
        <Button
          className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 py-5"
        >
          <Phone size={16} className="mr-1" /> SOS Help
        </Button>
      </div>

      {/* End Trip */}
      <div className="px-4 pt-3">
        <Button
          onClick={() => navigate("/debrief")}
          variant="outline"
          className="w-full border-primary text-primary py-5 rounded-xl"
        >
          <Shield size={16} className="mr-2" /> End Trip Safely
        </Button>
      </div>
    </div>
  );
};

export default ActiveTrip;
