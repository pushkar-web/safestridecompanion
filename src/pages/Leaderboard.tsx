import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Medal, Crown, Sparkles, Loader2, Flame, TrendingUp, Zap, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAwardPoints } from "@/hooks/use-points";

interface Ranked {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  level: number;
  streak_days: number;
  last_active_at: string;
}

interface BadgeRow {
  id: string;
  badge_title: string;
  badge_description: string | null;
  badge_icon: string | null;
  badge_type: string;
  earned_at: string;
}

interface PointEvent {
  id: string;
  user_id: string;
  action: string;
  amount: number;
  created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; emoji: string }> = {
  trip_completed: { label: "Safe trip", emoji: "🚶‍♀️" },
  report_submitted: { label: "Report", emoji: "📍" },
  badge_earned: { label: "Badge", emoji: "🏅" },
  daily_checkin: { label: "Check-in", emoji: "📅" },
  route_planned: { label: "Route", emoji: "🗺️" },
  chat_question: { label: "AI chat", emoji: "💬" },
  challenge_completed: { label: "Challenge", emoji: "🎯" },
  live_share: { label: "Live share", emoji: "📡" },
  high_risk_avoided: { label: "Risk avoided", emoji: "⚠️" },
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { award } = useAwardPoints();
  const [ranks, setRanks] = useState<Ranked[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeRow[]>([]);
  const [recentEvents, setRecentEvents] = useState<PointEvent[]>([]);
  const [tab, setTab] = useState<"ranks" | "badges" | "challenges" | "live">("ranks");
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState<string | null>(null);
  const [pulse, setPulse] = useState<string | null>(null);
  const [checkedInToday, setCheckedInToday] = useState(false);

  // Initial data load
  useEffect(() => {
    (async () => {
      const [points, badges, events] = await Promise.all([
        supabase
          .from("user_points" as any)
          .select("*")
          .order("points", { ascending: false })
          .limit(100),
        supabase.from("badges").select("*").order("earned_at", { ascending: false }).limit(40),
        supabase
          .from("point_events" as any)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setRanks((points.data as any) || []);
      setAllBadges((badges.data as any) || []);
      setRecentEvents((events.data as any) || []);

      // Check today's check-in
      if (user) {
        const today = new Date().toISOString().slice(0, 10);
        const { data: todayEvents } = await supabase
          .from("point_events" as any)
          .select("created_at")
          .eq("user_id", user.id)
          .eq("action", "daily_checkin")
          .gte("created_at", today)
          .limit(1);
        setCheckedInToday(!!todayEvents?.length);
      }

      setLoading(false);
    })();
  }, [user]);

  // Realtime subscription to user_points changes
  useEffect(() => {
    const channel = supabase
      .channel("leaderboard-points")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_points" }, (payload) => {
        const updated = payload.new as Ranked;
        if (!updated?.user_id) return;
        setRanks((prev) => {
          const existing = prev.find((r) => r.user_id === updated.user_id);
          let next: Ranked[];
          if (existing) {
            next = prev.map((r) => (r.user_id === updated.user_id ? { ...r, ...updated } : r));
          } else {
            next = [...prev, updated];
          }
          next.sort((a, b) => b.points - a.points);
          return next.slice(0, 100);
        });
        setPulse(updated.user_id);
        setTimeout(() => setPulse(null), 1600);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "point_events" }, (payload) => {
        const ev = payload.new as PointEvent;
        setRecentEvents((prev) => [ev, ...prev].slice(0, 20));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCheckIn = async () => {
    if (checkedInToday) return;
    await award("daily_checkin");
    setCheckedInToday(true);
  };

  // Build dynamic challenges based on user's actual point events
  const myEvents = user ? recentEvents.filter((e) => e.user_id === user.id) : [];
  const myTrips = myEvents.filter((e) => e.action === "trip_completed").length;
  const myReports = myEvents.filter((e) => e.action === "report_submitted").length;
  const myChat = myEvents.filter((e) => e.action === "chat_question").length;
  const myStreak = ranks.find((r) => r.user_id === user?.id)?.streak_days || 0;

  const challenges = [
    {
      title: "Trail Blazer",
      desc: "Complete 5 safe trips this week",
      icon: "🎯",
      progress: Math.min(100, (myTrips / 5) * 100),
      reward: "+100 pts",
      done: myTrips >= 5,
    },
    {
      title: "Community Guardian",
      desc: "Submit 3 community reports",
      icon: "🛡️",
      progress: Math.min(100, (myReports / 3) * 100),
      reward: "+100 pts",
      done: myReports >= 3,
    },
    {
      title: "Streak Master",
      desc: "Maintain a 7-day activity streak",
      icon: "🔥",
      progress: Math.min(100, (myStreak / 7) * 100),
      reward: "+200 pts",
      done: myStreak >= 7,
    },
    {
      title: "Curious Mind",
      desc: "Ask the AI 10 safety questions",
      icon: "💬",
      progress: Math.min(100, (myChat / 10) * 100),
      reward: "+50 pts",
      done: myChat >= 10,
    },
  ];

  const podium = ranks.slice(0, 3);
  const rest = ranks.slice(3, 50);
  const myRank = user ? ranks.findIndex((r) => r.user_id === user.id) : -1;

  return (
    <div className="min-h-screen bg-background pb-24 gradient-bg-subtle">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-5">
        <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-xl glass-card flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-display font-bold text-foreground">Leaderboard</h1>
        <div className="h-10 w-10 rounded-xl glass-card flex items-center justify-center">
          <Trophy size={18} className="text-primary" />
        </div>
      </div>

      {/* Personal stats banner */}
      {user && myRank !== -1 && ranks[myRank] && (
        <div className="px-4">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl gradient-purple p-3 flex items-center gap-3 shadow-lg"
          >
            <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold text-primary-foreground">
              #{myRank + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-primary-foreground/80">Your rank</p>
              <p className="text-sm font-display font-bold text-primary-foreground truncate">
                Lvl {ranks[myRank].level} · {ranks[myRank].points.toLocaleString()} pts
              </p>
            </div>
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
              <Flame size={12} className="text-warning" />
              <span className="text-xs font-bold text-primary-foreground">{ranks[myRank].streak_days}d</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Daily check-in */}
      {user && (
        <div className="px-4 pt-3">
          <button
            onClick={handleCheckIn}
            disabled={checkedInToday}
            className={`w-full rounded-2xl p-3 flex items-center gap-3 transition-all ${
              checkedInToday
                ? "bg-safe/10 text-safe cursor-not-allowed"
                : "card-interactive hover:scale-[1.01]"
            }`}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${checkedInToday ? "bg-safe/20" : "bg-accent"}`}>
              <Calendar size={18} className={checkedInToday ? "text-safe" : "text-primary"} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-foreground">
                {checkedInToday ? "Checked in today ✓" : "Daily check-in"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {checkedInToday ? "Come back tomorrow" : "Earn +10 points & keep your streak alive"}
              </p>
            </div>
            {!checkedInToday && <Zap size={18} className="text-warning" />}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl glass-card">
          {[
            { k: "ranks", l: "Ranks", i: Crown },
            { k: "badges", l: "Badges", i: Medal },
            { k: "challenges", l: "Quests", i: Flame },
            { k: "live", l: "Live", i: TrendingUp },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as any)}
              className={`py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                tab === t.k
                  ? "gradient-purple text-primary-foreground shadow-md"
                  : "text-muted-foreground"
              }`}
            >
              <t.i size={11} /> {t.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center pt-20">
          <Loader2 size={28} className="text-primary animate-spin" />
        </div>
      ) : tab === "ranks" ? (
        <div className="px-4 pt-5">
          {/* Podium */}
          {podium.length >= 3 && (
            <div className="flex items-end justify-center gap-3 mb-6 pt-4">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl gradient-purple opacity-80 flex items-center justify-center text-xl font-bold text-primary-foreground mb-2">
                  {podium[1].display_name?.[0] || "?"}
                </div>
                <p className="text-xs font-semibold text-foreground truncate max-w-[80px]">{podium[1].display_name}</p>
                <p className="text-[10px] text-muted-foreground">{podium[1].points.toLocaleString()} pts</p>
                <div className="w-20 h-16 rounded-t-xl bg-muted mt-2 flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-muted-foreground">2</span>
                </div>
              </motion.div>
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center">
                <Crown size={20} className="text-warning mb-1" />
                <div className="h-16 w-16 rounded-2xl gradient-purple flex items-center justify-center text-2xl font-bold text-primary-foreground mb-2 glow-purple">
                  {podium[0].display_name?.[0] || "?"}
                </div>
                <p className="text-sm font-bold text-foreground truncate max-w-[90px]">{podium[0].display_name}</p>
                <p className="text-xs text-primary font-semibold">{podium[0].points.toLocaleString()} pts</p>
                <div className="w-24 h-20 rounded-t-xl gradient-purple mt-2 flex items-center justify-center">
                  <span className="text-3xl font-display font-bold text-primary-foreground">1</span>
                </div>
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl gradient-safe opacity-80 flex items-center justify-center text-xl font-bold text-primary-foreground mb-2">
                  {podium[2].display_name?.[0] || "?"}
                </div>
                <p className="text-xs font-semibold text-foreground truncate max-w-[80px]">{podium[2].display_name}</p>
                <p className="text-[10px] text-muted-foreground">{podium[2].points.toLocaleString()} pts</p>
                <div className="w-20 h-12 rounded-t-xl bg-muted mt-2 flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-muted-foreground">3</span>
                </div>
              </motion.div>
            </div>
          )}

          <div className="space-y-2">
            {rest.length === 0 && podium.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No rankings yet. Take a trip to earn your spot! 🏆
              </div>
            ) : (
              <AnimatePresence>
                {rest.map((r, i) => (
                  <motion.div
                    key={r.user_id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: pulse === r.user_id ? [1, 1.04, 1] : 1,
                      boxShadow: pulse === r.user_id ? "0 0 0 2px hsl(var(--primary))" : "none",
                    }}
                    transition={{ delay: i * 0.02, scale: { duration: 0.6 } }}
                    className={`card-interactive rounded-2xl p-3 flex items-center gap-3 ${
                      r.user_id === user?.id ? "ring-2 ring-primary/50" : ""
                    }`}
                  >
                    <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-primary">
                      {i + 4}
                    </div>
                    <div className="h-9 w-9 rounded-xl gradient-purple flex items-center justify-center text-sm font-bold text-primary-foreground relative">
                      {r.display_name?.[0] || "?"}
                      {r.streak_days >= 5 && (
                        <span className="absolute -top-1 -right-1 text-[10px]">🔥</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {r.display_name}
                        {r.user_id === user?.id && <span className="text-[10px] text-primary ml-1">(you)</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Lvl {r.level} · {r.streak_days}d streak
                      </p>
                    </div>
                    <p className="text-sm font-bold text-primary">{r.points.toLocaleString()}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      ) : tab === "badges" ? (
        <div className="px-4 pt-5">
          <div className="grid grid-cols-2 gap-3">
            {allBadges.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">
                No badges earned yet. Start a trip to earn your first! 🛡️
              </div>
            ) : (
              allBadges.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setFlipped(flipped === b.id ? null : b.id)}
                  className="aspect-square cursor-pointer relative"
                  style={{ perspective: 800 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: flipped === b.id ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div
                      className="absolute inset-0 rounded-2xl gradient-purple p-3 flex flex-col items-center justify-center"
                      style={{ backfaceVisibility: "hidden", boxShadow: "0 12px 30px -10px hsl(var(--primary) / 0.4)" }}
                    >
                      <div className="text-4xl mb-2">{b.badge_icon || "🛡️"}</div>
                      <p className="text-xs font-bold text-primary-foreground text-center">{b.badge_title}</p>
                      <p className="text-[9px] text-primary-foreground/70 mt-0.5">Tap to flip</p>
                    </div>
                    <div
                      className="absolute inset-0 rounded-2xl bg-card border border-border p-3 flex flex-col items-center justify-center text-center"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      <Sparkles size={16} className="text-primary mb-1" />
                      <p className="text-[10px] text-foreground leading-relaxed">{b.badge_description || "Earned for safe travel."}</p>
                      <p className="text-[9px] text-muted-foreground mt-2">{new Date(b.earned_at).toLocaleDateString()}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      ) : tab === "challenges" ? (
        <div className="px-4 pt-5 space-y-3">
          {challenges.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`card-elevated rounded-2xl p-4 ${c.done ? "ring-2 ring-safe/40" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-2xl">
                  {c.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-display font-bold text-foreground">{c.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.done ? "bg-safe/15 text-safe" : "bg-primary/10 text-primary"
                    }`}>
                      {c.done ? "✓ Done" : c.reward}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                  <div className="mt-2.5 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full ${c.done ? "gradient-safe" : "gradient-purple"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${c.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{Math.round(c.progress)}% complete</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // LIVE FEED
        <div className="px-4 pt-5 space-y-2">
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">
            Recent activity (realtime)
          </p>
          {recentEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No recent activity yet. Be the first! ⚡
            </div>
          ) : (
            <AnimatePresence>
              {recentEvents.map((ev) => {
                const meta = ACTION_LABELS[ev.action] || { label: ev.action, emoji: "✨" };
                const userName = ranks.find((r) => r.user_id === ev.user_id)?.display_name || "Someone";
                const ago = Math.max(0, Math.round((Date.now() - new Date(ev.created_at).getTime()) / 60000));
                return (
                  <motion.div
                    key={ev.id}
                    layout
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="card-interactive rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-base">
                      {meta.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground">
                        <span className="font-bold">{userName}</span>{" "}
                        <span className="text-muted-foreground">earned points for</span>{" "}
                        <span className="font-semibold">{meta.label}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {ago < 1 ? "just now" : `${ago}m ago`}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-primary">+{ev.amount}</div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
