import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Mic, MicOff, AlertTriangle, ArrowRight, Sparkles, MapPin, Clock, TrendingUp, Shield } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import logo from "@/assets/safestride-logo.png";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { useTrip } from "@/contexts/TripContext";
import { toast } from "@/hooks/use-toast";

const Home = () => {
  const navigate = useNavigate();
  const { startTrip } = useTrip();
  const { unreadCount } = useNotifications();
  const [spokenText, setSpokenText] = useState("");

  const handleVoiceResult = useCallback((text: string) => {
    setSpokenText(text);
    toast({ title: "Voice captured", description: `"${text}"` });

    const lower = text.toLowerCase();
    let from = "Andheri";
    let to = "Bandra";

    const mumbaiLocations = ["bandra", "andheri", "juhu", "kurla", "dadar", "worli", "colaba", "churchgate", "goregaon", "malad", "borivali", "powai", "thane", "vashi", "panvel"];
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
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <div className="min-h-screen bg-background pb-24 gradient-bg-subtle">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-5">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-card shadow-sm flex items-center justify-center">
            <img src={logo} alt="SafeStride" className="h-6 w-6 object-contain" />
          </div>
          <div>
            <span className="font-display font-bold text-foreground text-sm">SafeStride</span>
            <p className="text-[9px] text-muted-foreground font-medium">AI Safety Companion</p>
          </div>
        </div>
        <button onClick={() => navigate("/notifications")} className="relative h-10 w-10 rounded-xl glass-card flex items-center justify-center">
          <Bell size={18} className="text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[8px] font-bold text-primary-foreground">{unreadCount > 9 ? "9+" : unreadCount}</span>
            </span>
          )}
        </button>
      </div>

      {/* Greeting + Voice */}
      <div className="px-5 pt-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs text-muted-foreground font-medium mb-1">Good Evening 👋</p>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Hello, <span className="text-gradient-purple">Ananya</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">Where are we heading today?</p>
        </motion.div>

        {/* Voice CTA */}
        <div className="flex flex-col items-center pt-8 pb-2">
          <motion.div className="relative">
            {/* Outer ring animation */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full bg-safe/20"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ margin: -12 }}
              />
            )}
            <motion.button
              onClick={handleVoiceToggle}
              className={`h-22 w-22 rounded-full flex items-center justify-center relative z-10 ${
                isListening ? "gradient-safe glow-safe" : "gradient-purple glow-purple"
              }`}
              style={{ height: 88, width: 88 }}
              whileTap={{ scale: 0.95 }}
              animate={isListening ? { scale: [1, 1.06, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              {isListening ? (
                <MicOff size={34} className="text-primary-foreground" />
              ) : (
                <Mic size={34} className="text-primary-foreground" />
              )}
            </motion.button>
          </motion.div>

          <p className="text-xs font-bold text-primary mt-4 uppercase tracking-widest">
            {isListening ? "Listening..." : "Speak Route"}
          </p>

          {/* Live transcript */}
          {(transcript || spokenText) && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-3 px-5 py-2.5 rounded-2xl glass-card max-w-[300px]"
            >
              <p className="text-sm text-foreground italic">
                "{transcript || spokenText}"
              </p>
            </motion.div>
          )}

          {error && <p className="text-xs text-destructive mt-2">{error}</p>}

          <p className="text-[10px] text-muted-foreground mt-3 bg-accent/50 px-3 py-1.5 rounded-full">
            💡 Try: "Navigate me safely to Bandra West"
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-5 pt-4">
        <div className="flex gap-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex-1 card-interactive rounded-2xl p-4 text-center"
          >
            <div className="h-10 w-10 rounded-xl bg-safe/10 flex items-center justify-center mx-auto mb-2">
              <TrendingUp size={18} className="text-safe" />
            </div>
            <p className="text-lg font-display font-bold text-foreground">12</p>
            <p className="text-[10px] text-muted-foreground">Trips This Week</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 card-interactive rounded-2xl p-4 text-center"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Shield size={18} className="text-primary" />
            </div>
            <p className="text-lg font-display font-bold text-foreground">98%</p>
            <p className="text-[10px] text-muted-foreground">Safety Score</p>
          </motion.div>
        </div>
      </div>

      {/* Safety Insights */}
      <div className="px-5 pt-5">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Sparkles size={12} /> Safety Insights
        </h3>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-interactive rounded-2xl p-4 mb-3"
        >
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Shield size={22} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">Today's Risk: Low</h4>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-safe/15 text-safe font-bold uppercase">Safe</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Optimal conditions detected across your usual routes in Mumbai.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-interactive rounded-2xl p-4 mb-3"
        >
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-safe/10 flex items-center justify-center flex-shrink-0">
              <MapPin size={22} className="text-safe" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">Last Trip: Safe</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                4.3 km from Bandra to Juhu, covered without any alerts.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock size={10} /> 18 min
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Shield size={10} /> 0 alerts
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Guardian Feature Card */}
      <motion.div
        className="mx-5 mt-2 rounded-2xl gradient-purple p-5 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary-foreground/5" />
        <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-primary-foreground/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-primary-foreground/80" />
            <span className="text-[10px] text-primary-foreground/60 font-bold uppercase tracking-widest">New Feature</span>
          </div>
          <h2 className="text-lg font-display font-bold text-primary-foreground">
            AI Guardian Mode
          </h2>
          <p className="text-sm text-primary-foreground/75 mt-1 mb-4 leading-relaxed">
            Share live location with emergency contacts automatically after dark.
          </p>
          <Button
            onClick={() => navigate("/settings")}
            className="bg-primary-foreground/15 text-primary-foreground border-primary-foreground/20 border hover:bg-primary-foreground/25 text-sm rounded-xl backdrop-blur-sm"
          >
            Setup Now <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
