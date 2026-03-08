import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Shield, Mic, MicOff, Menu, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { useTrip } from "@/contexts/TripContext";
import { toast } from "@/hooks/use-toast";

const Home = () => {
  const navigate = useNavigate();
  const { startTrip } = useTrip();
  const [spokenText, setSpokenText] = useState("");

  const handleVoiceResult = useCallback((text: string) => {
    setSpokenText(text);
    toast({ title: "Voice captured", description: `"${text}"` });

    // Parse destination from spoken text
    const lower = text.toLowerCase();
    let from = "Andheri";
    let to = "Bandra";

    // Try to extract locations
    const mumbaiLocations = ["bandra", "andheri", "juhu", "kurla", "dadar", "worli", "colaba", "churchgate", "goregaon", "malad", "borivali"];
    const mentioned = mumbaiLocations.filter((loc) => lower.includes(loc));
    if (mentioned.length >= 2) {
      from = mentioned[0].charAt(0).toUpperCase() + mentioned[0].slice(1);
      to = mentioned[1].charAt(0).toUpperCase() + mentioned[1].slice(1);
    } else if (mentioned.length === 1) {
      to = mentioned[0].charAt(0).toUpperCase() + mentioned[0].slice(1);
    }

    startTrip(from, to);

    setTimeout(() => navigate("/planner"), 1000);
  }, [navigate, startTrip]);

  const { isListening, transcript, error, startListening, stopListening } = useVoiceInput(handleVoiceResult);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Menu size={20} className="text-foreground" />
          <div className="flex items-center gap-1.5">
            <Shield className="text-primary" size={18} />
            <span className="font-display font-bold text-foreground">SafeStride</span>
          </div>
        </div>
        <button className="relative">
          <Bell size={20} className="text-muted-foreground" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
        </button>
      </div>

      {/* Greeting + Voice */}
      <div className="px-5 pt-4 text-center">
        <motion.h1
          className="text-2xl font-display font-bold text-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Hello, Ananya
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-1">Where are we heading today?</p>

        {/* Voice CTA */}
        <div className="flex flex-col items-center pt-6 pb-2">
          <motion.button
            onClick={handleVoiceToggle}
            className={`h-20 w-20 rounded-full flex items-center justify-center ${
              isListening ? "gradient-safe glow-safe" : "gradient-purple glow-purple"
            }`}
            animate={isListening ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            {isListening ? (
              <MicOff size={32} className="text-primary-foreground" />
            ) : (
              <Mic size={32} className="text-primary-foreground" />
            )}
          </motion.button>
          <p className="text-xs font-semibold text-primary mt-3 uppercase tracking-wide">
            {isListening ? "Listening..." : "Speak Route"}
          </p>

          {/* Live transcript */}
          {(transcript || spokenText) && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 px-4 py-2 rounded-lg bg-accent/50 max-w-[280px]"
            >
              <p className="text-sm text-foreground italic">
                "{transcript || spokenText}"
              </p>
            </motion.div>
          )}

          {error && (
            <p className="text-xs text-destructive mt-2">{error}</p>
          )}

          <p className="text-[10px] text-muted-foreground mt-2">
            Try: "Navigate me safely to Bandra West"
          </p>
        </div>
      </div>

      {/* Safety Insights */}
      <div className="px-5 pt-4">
        <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
          Safety Insights
        </h3>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated rounded-xl p-4 mb-3"
        >
          <div className="flex items-start gap-3">
            <div className="h-14 w-14 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Shield size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">Today's Risk: Low</h4>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-safe/15 text-safe font-bold">✓</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Optimal conditions detected across your usual routes in Mumbai.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated rounded-xl p-4 mb-3"
        >
          <div className="flex items-start gap-3">
            <div className="h-14 w-14 rounded-lg bg-safe/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={24} className="text-safe" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">Last Trip: Safe</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                4.3 km from Bandra to Juhu, covered without any alerts.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Guardian Feature Card */}
      <motion.div
        className="mx-5 mt-2 rounded-2xl gradient-purple p-5"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-base font-display font-bold text-primary-foreground">
          New Feature: AI Guardian
        </h2>
        <p className="text-sm text-primary-foreground/80 mt-1 mb-3">
          Share live location with emergency contacts automatically after dark.
        </p>
        <Button
          onClick={() => navigate("/settings")}
          variant="secondary"
          className="bg-primary-foreground/20 text-primary-foreground border-0 hover:bg-primary-foreground/30 text-sm"
        >
          Setup Now <ArrowRight size={14} className="ml-1" />
        </Button>
      </motion.div>
    </div>
  );
};

export default Home;
