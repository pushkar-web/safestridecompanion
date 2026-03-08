import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, CheckCircle, BookOpen, Share2, ChevronRight, MapPin, Loader2, Sparkles, Star, Clock } from "lucide-react";
import logo from "@/assets/safestride-logo.png";
import { Button } from "@/components/ui/button";
import { generateBadge, type BadgeData } from "@/lib/safety-ai";
import { useTrip } from "@/contexts/TripContext";
import { toast } from "@/hooks/use-toast";

const emojis = [
  { emoji: "😊", label: "Great" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😰", label: "Scary" },
  { emoji: "😡", label: "Unsafe" },
  { emoji: "🤔", label: "Unsure" },
];

const Debrief = () => {
  const navigate = useNavigate();
  const { trip } = useTrip();
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const routeFrom = trip?.routeFrom || "Andheri";
  const routeTo = trip?.routeTo || "Bandra";
  const risksAverted = trip?.risksAverted || 3;

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const data = await generateBadge(routeFrom, routeTo, risksAverted);
        setBadge(data);
      } catch (e) {
        console.error("Badge generation error:", e);
        setBadge({
          badge_title: "Safe Navigator",
          badge_description: "Completed a safe journey through Mumbai",
          achievement_message: "Well done! You navigated safely.",
          safety_tip: "Always stick to well-lit main roads at night.",
          know_your_rights: { section: "IPC Section 354", description: "Assault or criminal force to woman with intent to outrage her modesty." },
          rag_sources: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBadge();
  }, [routeFrom, routeTo, risksAverted]);

  const handleShare = async () => {
    if (navigator.share && badge) {
      try {
        await navigator.share({
          title: `SafeStride Badge: ${badge.badge_title}`,
          text: `${badge.achievement_message}\n\n${badge.safety_tip}`,
          url: window.location.href,
        });
      } catch {
        toast({ title: "Copied!", description: "Badge link copied to clipboard" });
      }
    } else {
      navigator.clipboard.writeText(`SafeStride Badge: ${badge?.badge_title} - ${badge?.achievement_message}`);
      toast({ title: "Copied!", description: "Badge details copied to clipboard" });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8 gradient-bg-subtle">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/home")} className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-foreground">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-display font-bold text-foreground text-sm">Post-Trip Debrief</h1>
            <p className="text-[9px] text-muted-foreground font-medium">AI Safety Analysis</p>
          </div>
        </div>
        <button onClick={handleShare} className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-muted-foreground">
          <Share2 size={16} />
        </button>
      </div>

      {/* Success Hero */}
      <motion.div
        className="flex flex-col items-center px-6 pt-6 pb-8 relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Ambient glow */}
        <div className="absolute w-48 h-48 rounded-full bg-safe/8 blur-3xl" />
        
        <motion.div
          className="h-20 w-20 rounded-2xl bg-safe/10 flex items-center justify-center mb-4 relative z-10 border border-safe/20"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <CheckCircle size={40} className="text-safe" />
        </motion.div>
        <h2 className="text-xl font-display font-bold text-foreground relative z-10">Well Done, Traveler! 🎉</h2>
        <p className="text-sm text-muted-foreground mt-1.5 relative z-10 flex items-center gap-1.5">
          <MapPin size={13} /> {routeFrom} → {routeTo} completed safely
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="px-5 flex gap-3">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 card-elevated rounded-2xl p-4 text-center"
        >
          <div className="h-10 w-10 rounded-xl bg-safe/10 flex items-center justify-center mx-auto mb-2">
            <Shield size={18} className="text-safe" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{risksAverted}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Risks Averted</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex-1 card-elevated rounded-2xl p-4 text-center"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Clock size={18} className="text-primary" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {trip?.startTime ? Math.floor((Date.now() - trip.startTime) / 60000) : 12}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">Minutes</p>
        </motion.div>
      </div>

      {/* AI-Generated Safety Badge */}
      <motion.div
        className="mx-5 mt-4 card-elevated rounded-2xl p-6 flex flex-col items-center relative overflow-hidden"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 gradient-purple" />

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 size={24} className="text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">AI generating your badge...</p>
          </div>
        ) : badge ? (
          <>
            <div className="flex items-center gap-1.5 mb-3">
              <Star size={12} className="text-primary" />
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Safety Badge</p>
              <Star size={12} className="text-primary" />
            </div>

            <motion.div
              className="h-24 w-24 rounded-2xl bg-card flex items-center justify-center mb-4 badge-glow shadow-lg"
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <img src={logo} alt="SafeStride Badge" className="h-16 w-16 object-contain" />
            </motion.div>

            <p className="text-lg font-display font-bold text-foreground mb-1">"{badge.badge_title}"</p>
            <p className="text-xs text-muted-foreground text-center mb-4 leading-relaxed">{badge.badge_description}</p>

            <p className="text-sm text-foreground text-center mb-4 leading-relaxed">{badge.achievement_message}</p>

            <div className="w-full glass-card rounded-xl p-4 mb-4">
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Sparkles size={10} /> Safety Tip
              </p>
              <p className="text-xs text-foreground leading-relaxed">{badge.safety_tip}</p>
            </div>

            <Button onClick={handleShare} className="gradient-purple text-primary-foreground rounded-xl px-6 glow-purple">
              <Share2 size={14} className="mr-2" /> Share Achievement
            </Button>
          </>
        ) : null}
      </motion.div>

      {/* Know Your Rights */}
      <motion.div
        className="px-5 pt-5"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <div className="card-elevated rounded-2xl overflow-hidden">
          <div className="h-16 gradient-purple flex items-center justify-center gap-2">
            <BookOpen size={22} className="text-primary-foreground" />
            <span className="text-primary-foreground font-display font-bold text-sm">Know Your Rights</span>
          </div>
          <div className="p-4">
            {badge?.know_your_rights ? (
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                <strong className="text-foreground">{badge.know_your_rights.section}:</strong> {badge.know_your_rights.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                <strong className="text-foreground">IPC Section 354:</strong> Assault or criminal force to woman with intent to outrage her modesty.
              </p>
            )}
            <Button className="w-full gradient-purple text-primary-foreground rounded-xl text-sm">
              Read More <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </motion.div>

      {badge?.rag_sources && badge.rag_sources.length > 0 && (
        <div className="px-5 pt-3">
          <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
            <Sparkles size={8} /> Powered by {badge.rag_sources.length} local safety sources
          </p>
        </div>
      )}

      {/* Feedback */}
      <motion.div
        className="px-5 pt-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        <div className="card-elevated rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-foreground mb-1">How was your journey?</p>
          <p className="text-xs text-muted-foreground mb-4">Help us improve safety for your route</p>
          <div className="flex justify-center gap-2">
            {emojis.map((e) => (
              <motion.button
                key={e.label}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
                  selectedEmoji === e.label
                    ? "bg-accent ring-2 ring-primary/30 scale-105"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => {
                  setSelectedEmoji(e.label);
                  toast({ title: "Thanks!", description: `Feedback: ${e.label} recorded` });
                }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-2xl">{e.emoji}</span>
                <span className="text-[9px] text-muted-foreground font-medium">{e.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Back to Home */}
      <div className="px-5 pt-5">
        <Button
          onClick={() => navigate("/home")}
          className="w-full gradient-purple text-primary-foreground py-5 rounded-2xl font-semibold glow-purple"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default Debrief;
