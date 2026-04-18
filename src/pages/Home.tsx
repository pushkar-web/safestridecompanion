import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Mic, MicOff, ArrowRight, Sparkles, MapPin, Clock, TrendingUp, Shield, Menu, Flame, AlertOctagon, Trophy } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import AppSidebar from "@/components/AppSidebar";
import logo from "@/assets/safestride-logo.png";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { useTrip } from "@/contexts/TripContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const navigate = useNavigate();
  const { startTrip } = useTrip();
  const { unreadCount } = useNotifications();
  const { displayName, user } = useAuth();
  const userName = displayName || "there";
  const [spokenText, setSpokenText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ trips: 0, score: 100, recentReports: 0 });
  const [recentAlerts, setRecentAlerts] = useState<Array<{ id: string; description: string; location: string; severity: string }>>([]);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Up Late" : hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : hour < 21 ? "Good Evening" : "Stay Safe Tonight";
  const greetingEmoji = hour < 5 ? "🌙" : hour < 12 ? "☀️" : hour < 17 ? "👋" : hour < 21 ? "🌆" : "🌙";

  // Fetch real data
  useEffect(() => {
    (async () => {
      const [trips, reports] = await Promise.all([
        user ? supabase.from("trip_history").select("risks_averted, risk_score").eq("user_id", user.id) : Promise.resolve({ data: [] }),
        supabase.from("safety_reports").select("id, description, location_name, severity").order("created_at", { ascending: false }).limit(3),
      ]);

      const tripCount = trips.data?.length || 0;
      const avgRisk = trips.data?.length
        ? trips.data.reduce((s: number, t: any) => s + (t.risk_score || 0), 0) / trips.data.length
        : 25;
      const score = Math.max(0, Math.min(100, Math.round(100 - avgRisk)));

      setStats({ trips: tripCount, score, recentReports: reports.data?.length || 0 });

      if (reports.data) {
        setRecentAlerts(
          reports.data.map((r: any) => ({
            id: r.id,
            description: r.description,
            location: r.location_name || "Mumbai",
            severity: r.severity,
          }))
        );
      }
    })();
  }, [user]);

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
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* 3D Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] -top-48 -left-48"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06), transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px] bottom-0 right-[-100px]"
          style={{ background: "radial-gradient(circle, hsl(var(--safe) / 0.05), transparent 70%)" }}
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
        {/* Floating 3D shapes */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-2xl border border-primary/[0.06] bg-primary/[0.02]"
            style={{
              width: 30 + i * 15,
              height: 30 + i * 15,
              right: `${5 + i * 12}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              y: [0, -15 - i * 3, 0],
              rotate: [i * 20, i * 20 + 30, i * 20],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ repeat: Infinity, duration: 5 + i, delay: i * 0.8 }}
          />
        ))}
      </div>

      {/* Sidebar */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-5 relative z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="h-10 w-10 rounded-xl glass-card flex items-center justify-center text-foreground hover:bg-accent/60 transition-colors"
          >
            <Menu size={18} />
          </button>
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
      <div className="px-5 pt-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs text-muted-foreground font-medium mb-1">Good Evening 👋</p>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Hello, <span className="text-gradient-purple">{userName}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">Where are we heading today?</p>
        </motion.div>

        {/* Voice CTA */}
        <div className="flex flex-col items-center pt-8 pb-2">
          <motion.div className="relative">
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: "hsl(var(--safe) / 0.2)", margin: -12 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
            <motion.button
              onClick={handleVoiceToggle}
              className={`rounded-full flex items-center justify-center relative z-10 ${
                isListening ? "gradient-safe" : "gradient-purple"
              }`}
              style={{
                height: 88,
                width: 88,
                boxShadow: isListening
                  ? "0 12px 40px -8px hsl(var(--safe) / 0.4), 0 0 0 1px hsl(var(--safe) / 0.2)"
                  : "0 12px 40px -8px hsl(var(--primary) / 0.4), 0 0 0 1px hsl(var(--primary) / 0.2)",
              }}
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

          {(transcript || spokenText) && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-3 px-5 py-2.5 rounded-2xl glass-card max-w-[300px]"
            >
              <p className="text-sm text-foreground italic">"{transcript || spokenText}"</p>
            </motion.div>
          )}

          {error && <p className="text-xs text-destructive mt-2">{error}</p>}

          <p className="text-[10px] text-muted-foreground mt-3 bg-accent/50 px-3 py-1.5 rounded-full">
            💡 Try: "Navigate me safely to Bandra West"
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-5 pt-4 relative z-10">
        <div className="flex gap-3">
          {[
            { icon: TrendingUp, value: "12", label: "Trips This Week", color: "safe" },
            { icon: Shield, value: "98%", label: "Safety Score", color: "primary" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="flex-1 rounded-2xl p-4 text-center relative overflow-hidden"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border) / 0.6)",
                boxShadow: "0 4px 20px -5px hsl(var(--primary) / 0.06), 0 1px 3px hsl(var(--foreground) / 0.04)",
              }}
            >
              <div className={`h-10 w-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center mx-auto mb-2`}>
                <stat.icon size={18} className={`text-${stat.color}`} />
              </div>
              <p className="text-lg font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Safety Insights */}
      <div className="px-5 pt-5 relative z-10">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Sparkles size={12} /> Safety Insights
        </h3>

        {[
          {
            icon: Shield,
            title: "Today's Risk: Low",
            badge: "Safe",
            badgeColor: "safe",
            desc: "Optimal conditions detected across your usual routes in Mumbai.",
          },
          {
            icon: MapPin,
            title: "Last Trip: Safe",
            desc: "4.3 km from Bandra to Juhu, covered without any alerts.",
            meta: [
              { icon: Clock, text: "18 min" },
              { icon: Shield, text: "0 alerts" },
            ],
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.05 }}
            className="rounded-2xl p-4 mb-3"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border) / 0.6)",
              boxShadow: "0 4px 20px -5px hsl(var(--primary) / 0.06)",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <card.icon size={22} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">{card.title}</h4>
                  {card.badge && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-safe/15 font-bold uppercase" style={{ color: "hsl(var(--safe))" }}>
                      {card.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.desc}</p>
                {card.meta && (
                  <div className="flex items-center gap-3 mt-2">
                    {card.meta.map((m) => (
                      <span key={m.text} className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <m.icon size={10} /> {m.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Guardian Feature Card */}
      <motion.div
        className="mx-5 mt-2 rounded-2xl gradient-purple p-5 relative overflow-hidden z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        style={{ boxShadow: "0 12px 40px -10px hsl(var(--primary) / 0.35)" }}
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary-foreground/5" />
        <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-primary-foreground/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-primary-foreground/80" />
            <span className="text-[10px] text-primary-foreground/60 font-bold uppercase tracking-widest">New Feature</span>
          </div>
          <h2 className="text-lg font-display font-bold text-primary-foreground">AI Guardian Mode</h2>
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
