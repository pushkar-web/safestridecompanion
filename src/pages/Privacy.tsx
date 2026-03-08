import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Database, Cloud, Trash2, Eye, Sparkles, Fingerprint } from "lucide-react";
import logo from "@/assets/safestride-logo.png";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  const [activeTab, setActiveTab] = useState<"home" | "cloud" | "local">("home");

  return (
    <div className="min-h-screen bg-background pb-24 gradient-bg-subtle">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-5">
        <h1 className="text-base font-display font-bold text-foreground flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-card shadow-sm flex items-center justify-center">
            <img src={logo} alt="SafeStride" className="h-5 w-5 object-contain" />
          </div>
          Privacy Dashboard
        </h1>
        <span className="text-[9px] px-2.5 py-1 rounded-full gradient-purple text-primary-foreground font-bold">PRO</span>
      </div>

      {/* Storage + Encryption */}
      <div className="flex gap-3 px-4 mt-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 card-interactive rounded-2xl p-4 text-center"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Database size={18} className="text-primary" />
          </div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Local Storage</p>
          <p className="text-xl font-display font-bold text-foreground mt-0.5">1.2 GB</p>
          <p className="text-[9px] text-safe font-semibold">Optimized ✓</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 card-interactive rounded-2xl p-4 text-center"
        >
          <div className="h-10 w-10 rounded-xl bg-safe/10 flex items-center justify-center mx-auto mb-2">
            <Lock size={18} className="text-safe" />
          </div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Encryption</p>
          <p className="text-xl font-display font-bold text-foreground mt-0.5">AES-256</p>
          <p className="text-[9px] text-safe font-semibold">Production Grade ✓</p>
        </motion.div>
      </div>

      {/* Data Flow Tabs */}
      <div className="px-4 pt-6">
        <h3 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5 uppercase tracking-widest">
          <Eye size={12} /> Data Flow Transparency
        </h3>
        <div className="flex gap-1 glass-card rounded-xl p-1 mb-3">
          {(["home", "cloud", "local"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-xs font-semibold py-2.5 rounded-lg transition-all capitalize ${
                activeTab === tab
                  ? "gradient-purple text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "local" ? "Local AI" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated rounded-2xl p-4"
        >
          <p className="text-sm text-foreground leading-relaxed">
            {activeTab === "home" && (
              <>
                <Fingerprint size={14} className="inline text-primary mr-1.5 -mt-0.5" />
                Your data is processed and stored locally on your device. No external transfers occur.
              </>
            )}
            {activeTab === "cloud" && (
              <>
                <Cloud size={14} className="inline text-primary mr-1.5 -mt-0.5" />
                Encrypted backups are sent to secure cloud storage. Only you hold the decryption key.
              </>
            )}
            {activeTab === "local" && (
              <>
                <Sparkles size={14} className="inline text-primary mr-1.5 -mt-0.5" />
                AI models run entirely on-device. No data leaves your phone for AI processing.
              </>
            )}
          </p>
        </motion.div>
      </div>

      {/* Activity Audit Log */}
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Activity Audit Log</h3>
          <button className="text-[10px] text-primary font-bold uppercase tracking-wider">View All</button>
        </div>
        <div className="space-y-2.5">
          {[
            { title: "Local Voice Analysis", desc: "Mic used for 2 min for SOS trigger command", time: "2m ago", icon: "🎙️" },
            { title: "Accelerometer Read", desc: "Motion data analyzed locally for fall detection", time: "5m ago", icon: "📱" },
            { title: "Location Fencing", desc: "Geofence check completed. No breach detected", time: "8m ago", icon: "📍" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="card-interactive rounded-2xl p-3.5"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 text-base">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-foreground font-semibold">{item.title}</p>
                    <span className="text-[9px] text-muted-foreground flex-shrink-0 ml-2 bg-muted px-2 py-0.5 rounded-full font-medium">{item.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Delete Data */}
      <div className="px-4 pt-6">
        <Button
          variant="outline"
          className="w-full border-2 border-destructive/20 text-destructive hover:bg-destructive/5 py-4 rounded-2xl font-semibold"
        >
          <Trash2 size={16} className="mr-2" /> One-Tap: Delete All Local Data
        </Button>
        <p className="text-[10px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
          <Shield size={8} /> SafeStride v2.4.0
        </p>
      </div>
    </div>
  );
};

export default Privacy;
