import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, CheckCircle, BookOpen, Share2, ChevronRight, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateBadge, type BadgeData } from "@/lib/safety-ai";
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
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const data = await generateBadge("Andheri", "Bandra", 3);
        setBadge(data);
      } catch (e) {
        console.error("Badge generation error:", e);
        toast({ title: "Badge Generation", description: "Using default badge", variant: "destructive" });
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
  }, []);

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/home")} className="text-foreground">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display font-bold text-foreground">Post-Trip Debrief</h1>
        </div>
        <button className="text-muted-foreground">
          <Share2 size={18} />
        </button>
      </div>

      {/* Success Hero */}
      <motion.div
        className="flex flex-col items-center px-6 pt-4 pb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="h-20 w-20 rounded-full bg-safe/10 flex items-center justify-center mb-4">
          <CheckCircle size={40} className="text-safe" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground">Well Done, Traveler!</h2>
        <p className="text-sm text-muted-foreground mt-1">You've reached your destination safely.</p>
      </motion.div>

      {/* Risks Averted */}
      <div className="px-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated rounded-xl p-4 text-center mb-3"
        >
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risks Averted</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">3</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Shield size={12} className="text-safe" />
            <span className="text-xs font-semibold text-safe">Safe Conduct</span>
          </div>
        </motion.div>

        {/* Route Insight */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated rounded-xl p-4 flex items-center gap-3 mb-3"
        >
          <MapPin size={18} className="text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Route Insight</p>
            <p className="text-xs text-muted-foreground">Safe path to destination</p>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <span className="text-xs font-medium">Details</span>
            <ChevronRight size={14} />
          </div>
        </motion.div>
      </div>

      {/* AI-Generated Safety Badge */}
      <motion.div
        className="mx-5 mt-2 card-elevated rounded-xl p-5 flex flex-col items-center"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 size={24} className="text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">AI generating your badge...</p>
          </div>
        ) : badge ? (
          <>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              🏆 AI-Generated Safety Badge
            </p>
            <p className="text-lg font-display font-bold text-foreground mb-1">"{badge.badge_title}"</p>
            <p className="text-xs text-muted-foreground text-center mb-3">{badge.badge_description}</p>
            
            {/* Generated badge visual */}
            <div className="h-24 w-24 rounded-2xl gradient-purple flex items-center justify-center mb-3 glow-purple">
              <Shield size={40} className="text-primary-foreground" />
            </div>

            <p className="text-sm text-foreground text-center mb-3">{badge.achievement_message}</p>

            <div className="w-full card-elevated rounded-lg p-3 mb-3 bg-accent/30">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">💡 Safety Tip</p>
              <p className="text-xs text-foreground">{badge.safety_tip}</p>
            </div>

            <Button className="gradient-purple text-primary-foreground rounded-xl px-6 glow-purple">
              <Share2 size={14} className="mr-2" /> Share Achievement
            </Button>
          </>
        ) : null}
      </motion.div>

      {/* Know Your Rights - AI sourced */}
      <div className="px-5 pt-5">
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="h-20 bg-accent/30 flex items-center justify-center">
            <BookOpen size={32} className="text-primary" />
          </div>
          <div className="p-4">
            <h4 className="text-sm font-semibold text-foreground mb-1">Know Your Rights</h4>
            {badge?.know_your_rights ? (
              <p className="text-xs text-muted-foreground mb-3">
                <strong>{badge.know_your_rights.section}:</strong> {badge.know_your_rights.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mb-3">
                <strong>IPC Section 354:</strong> Assault or criminal force to woman with intent to outrage her modesty.
              </p>
            )}
            <Button className="w-full gradient-purple text-primary-foreground rounded-xl text-sm">
              Read More
            </Button>
          </div>
        </div>
      </div>

      {/* RAG Sources */}
      {badge?.rag_sources && badge.rag_sources.length > 0 && (
        <div className="px-5 pt-3">
          <p className="text-[10px] text-muted-foreground text-center">
            Powered by {badge.rag_sources.length} local safety data sources via RAG
          </p>
        </div>
      )}

      {/* Feedback */}
      <div className="px-5 pt-5">
        <p className="text-sm font-semibold text-primary text-center mb-1">How was your journey?</p>
        <p className="text-xs text-muted-foreground text-center mb-3">Help us improve safety for your route</p>
        <div className="flex justify-center gap-3">
          {emojis.map((e) => (
            <button
              key={e.label}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-accent transition-colors"
            >
              <span className="text-2xl">{e.emoji}</span>
              <span className="text-[10px] text-muted-foreground">{e.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Back to Home */}
      <div className="px-5 pt-5">
        <Button
          onClick={() => navigate("/home")}
          className="w-full gradient-purple text-primary-foreground py-5 rounded-xl font-semibold glow-purple"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default Debrief;
