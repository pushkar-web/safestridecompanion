import { motion } from "framer-motion";
import { Shield, Lock, Database, Smartphone, Cloud, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4">
        <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <Shield className="text-primary" size={22} /> Privacy Center
        </h1>
      </div>

      {/* Security badges */}
      <div className="flex gap-3 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 glass-card rounded-xl p-4 text-center border border-safe/30"
        >
          <Lock size={20} className="text-safe mx-auto mb-2" />
          <p className="text-sm font-semibold text-safe">Encrypted</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 glass-card rounded-xl p-4 text-center border border-primary/30"
        >
          <Smartphone size={20} className="text-primary mx-auto mb-2" />
          <p className="text-sm font-semibold text-primary">100% Local</p>
        </motion.div>
      </div>

      {/* How data moves */}
      <div className="px-4 pt-5">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">HOW YOUR DATA MOVES</h3>
        <div className="flex items-center justify-center gap-4">
          {[
            { icon: Cloud, label: "Cloud" },
            { icon: Database, label: "Your Phone" },
            { icon: Lock, label: "Local AI" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="h-12 w-12 rounded-full glass-card flex items-center justify-center">
                <item.icon size={18} className="text-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4 pt-5">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">RECENT ACTIVITY</h3>
        <div className="space-y-2">
          {[
            { title: "Mix used for Emoji", desc: "Locally processed, never shared immutably", time: "2m ago" },
            { title: "Location Ping", desc: "End-to-end encrypted", time: "5m ago" },
            { title: "Likemind Processing", desc: "A trades places and point offline", time: "8m ago" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-card rounded-xl p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{item.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Offline Intelligence */}
      <div className="px-4 pt-5">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">AI INTELLIGENCE</h3>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Database size={18} className="text-primary mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">Offline Intelligence (RAG)</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-safe/20 text-safe font-bold">UPDATED</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sync your local safety database for offline AI assistance and route analysis.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Button size="sm" className="gradient-purple text-primary-foreground text-xs h-7">
                  <RefreshCw size={12} className="mr-1" /> Refresh
                </Button>
                <span className="text-[10px] text-safe">Last sync: 2h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Data */}
      <div className="px-4 pt-5">
        <Button
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive/10 py-4 rounded-xl"
        >
          <Trash2 size={16} className="mr-2" /> One-Tap: Delete All Local Data
        </Button>
        <p className="text-[10px] text-center text-muted-foreground mt-2">SafeStride v2.4.0</p>
      </div>
    </div>
  );
};

export default Privacy;
