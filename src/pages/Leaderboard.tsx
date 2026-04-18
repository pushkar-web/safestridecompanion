import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Medal, Crown, Sparkles, Shield, Loader2, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Ranked {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  trips: number;
  badges: number;
  reports: number;
  score: number;
}

interface BadgeRow {
  id: string;
  badge_title: string;
  badge_description: string | null;
  badge_icon: string | null;
  badge_type: string;
  earned_at: string;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [ranks, setRanks] = useState<Ranked[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeRow[]>([]);
  const [tab, setTab] = useState<"ranks" | "badges" | "challenges">("ranks");
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [trips, badges, reports, profiles] = await Promise.all([
        supabase.from("trip_history").select("user_id").not("user_id", "is", null),
        supabase.from("badges").select("*").order("earned_at", { ascending: false }).limit(40),
        supabase.from("safety_reports").select("reporter_name"),
        supabase.from("profiles").select("id, display_name, avatar_url"),
      ]);

      setAllBadges(badges.data || []);

      const profMap = new Map(
        (profiles.data || []).map((p: any) => [p.id, p])
      );

      const tripMap = new Map<string, number>();
      (trips.data || []).forEach((t: any) => {
        if (!t.user_id) return;
        tripMap.set(t.user_id, (tripMap.get(t.user_id) || 0) + 1);
      });

      const badgeMap = new Map<string, number>();
      (badges.data || []).forEach((b: any) => {
        badgeMap.set(b.user_id, (badgeMap.get(b.user_id) || 0) + 1);
      });

      const userIds = new Set<string>([...tripMap.keys(), ...badgeMap.keys()]);
      const out: Ranked[] = Array.from(userIds).map((uid) => {
        const p: any = profMap.get(uid);
        const trips = tripMap.get(uid) || 0;
        const badgeCt = badgeMap.get(uid) || 0;
        return {
          user_id: uid,
          display_name: p?.display_name || "Anonymous Hero",
          avatar_url: p?.avatar_url || null,
          trips,
          badges: badgeCt,
          reports: 0,
          score: trips * 10 + badgeCt * 25,
        };
      });

      out.sort((a, b) => b.score - a.score);
      setRanks(out);
      setLoading(false);
    })();
  }, []);

  const challenges = [
    { title: "First 5 Safe Trips", desc: "Complete 5 trips this week", icon: "🎯", progress: 60, reward: "+50 pts" },
    { title: "Community Guardian", desc: "Submit 3 community reports", icon: "🛡️", progress: 33, reward: "Guardian Badge" },
    { title: "Night Owl", desc: "Complete 2 trips after 9pm safely", icon: "🌙", progress: 100, reward: "Night Badge" },
  ];

  const podium = ranks.slice(0, 3);
  const rest = ranks.slice(3);

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

      {/* Tabs */}
      <div className="px-4 pt-2">
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl glass-card">
          {[
            { k: "ranks", l: "Rankings", i: Crown },
            { k: "badges", l: "Badges", i: Medal },
            { k: "challenges", l: "Challenges", i: Flame },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as any)}
              className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                tab === t.k
                  ? "gradient-purple text-primary-foreground shadow-md"
                  : "text-muted-foreground"
              }`}
            >
              <t.i size={12} /> {t.l}
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
              {/* 2nd */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl gradient-purple opacity-80 flex items-center justify-center text-xl font-bold text-primary-foreground mb-2">
                  {podium[1].display_name[0]}
                </div>
                <p className="text-xs font-semibold text-foreground truncate max-w-[80px]">{podium[1].display_name}</p>
                <p className="text-[10px] text-muted-foreground">{podium[1].score} pts</p>
                <div className="w-20 h-16 rounded-t-xl bg-muted mt-2 flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-muted-foreground">2</span>
                </div>
              </motion.div>
              {/* 1st */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center">
                <Crown size={20} className="text-warning mb-1" />
                <div className="h-16 w-16 rounded-2xl gradient-purple flex items-center justify-center text-2xl font-bold text-primary-foreground mb-2 glow-purple">
                  {podium[0].display_name[0]}
                </div>
                <p className="text-sm font-bold text-foreground truncate max-w-[90px]">{podium[0].display_name}</p>
                <p className="text-xs text-primary font-semibold">{podium[0].score} pts</p>
                <div className="w-24 h-20 rounded-t-xl gradient-purple mt-2 flex items-center justify-center">
                  <span className="text-3xl font-display font-bold text-primary-foreground">1</span>
                </div>
              </motion.div>
              {/* 3rd */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl gradient-safe opacity-80 flex items-center justify-center text-xl font-bold text-primary-foreground mb-2">
                  {podium[2].display_name[0]}
                </div>
                <p className="text-xs font-semibold text-foreground truncate max-w-[80px]">{podium[2].display_name}</p>
                <p className="text-[10px] text-muted-foreground">{podium[2].score} pts</p>
                <div className="w-20 h-12 rounded-t-xl bg-muted mt-2 flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-muted-foreground">3</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Rest */}
          <div className="space-y-2">
            {rest.length === 0 && podium.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No rankings yet. Take a trip to earn your spot! 🏆
              </div>
            ) : (
              rest.map((r, i) => (
                <motion.div
                  key={r.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card-interactive rounded-2xl p-3 flex items-center gap-3"
                >
                  <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-primary">
                    {i + 4}
                  </div>
                  <div className="h-9 w-9 rounded-xl gradient-purple flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {r.display_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{r.display_name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.trips} trips · {r.badges} badges</p>
                  </div>
                  <p className="text-sm font-bold text-primary">{r.score}</p>
                </motion.div>
              ))
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
                    {/* front */}
                    <div
                      className="absolute inset-0 rounded-2xl gradient-purple p-3 flex flex-col items-center justify-center"
                      style={{ backfaceVisibility: "hidden", boxShadow: "0 12px 30px -10px hsl(var(--primary) / 0.4)" }}
                    >
                      <div className="text-4xl mb-2">{b.badge_icon || "🛡️"}</div>
                      <p className="text-xs font-bold text-primary-foreground text-center">{b.badge_title}</p>
                      <p className="text-[9px] text-primary-foreground/70 mt-0.5">Tap to flip</p>
                    </div>
                    {/* back */}
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
      ) : (
        <div className="px-4 pt-5 space-y-3">
          {challenges.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-elevated rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-2xl">
                  {c.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-display font-bold text-foreground">{c.title}</p>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{c.reward}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                  <div className="mt-2.5 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full gradient-purple"
                      initial={{ width: 0 }}
                      animate={{ width: `${c.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{c.progress}% complete</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
