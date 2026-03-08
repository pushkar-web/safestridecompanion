import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Database, Smartphone, Cloud, RefreshCw, Trash2, Eye, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  const [activeTab, setActiveTab] = useState<"home" | "cloud" | "local">("home");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h1 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
          <Shield className="text-primary" size={20} /> Privacy Dashboard
        </h1>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">PRO</span>
      </div>

      {/* Storage + Encryption */}
      <div className="flex gap-3 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 card-elevated rounded-xl p-4 text-center"
        >
          <Database size={18} className="text-primary mx-auto mb-2" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Local Storage</p>
          <p className="text-xl font-display font-bold text-foreground">1.2 GB</p>
          <p className="text-[10px] text-muted-foreground">Optimized</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 card-elevated rounded-xl p-4 text-center"
        >
          <Lock size={18} className="text-safe mx-auto mb-2" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Encryption</p>
          <p className="text-xl font-display font-bold text-foreground">AES-256</p>
          <p className="text-[10px] text-muted-foreground">Production Grade</p>
        </motion.div>
      </div>

      {/* Data Flow Tabs */}
      <div className="px-4 pt-5">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Eye size={12} /> DATA FLOW TRANSPARENCY
        </h3>
        <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-3">
          {(["home", "cloud", "local"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors capitalize ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {tab === "local" ? "Local AI" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="card-elevated rounded-xl p-3">
          <p className="text-xs text-muted-foreground">
            {activeTab === "home" && "Your data is processed and stored locally on your device. No external transfers."}
            {activeTab === "cloud" && "Encrypted backups are sent to secure cloud storage. Only you hold the key."}
            {activeTab === "local" && "AI models run entirely on-device. No data leaves your phone for AI processing."}
          </p>
        </div>
      </div>

      {/* Activity Audit Log */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground">ACTIVITY AUDIT LOG</h3>
          <button className="text-xs text-primary font-medium">View All</button>
        </div>
        <div className="space-y-2">
          {[
            { title: "Local Voice Analysis", desc: "Mic used for 2 min for SOS trigger/listening command", time: "2m ago" },
            { title: "Accelerometer Read", desc: "Motion data analyzed locally for fall detection", time: "5m ago" },
            { title: "Location Fencing", desc: "Geofence check completed. No breach. Data not transmitted, GPS reads: 4", time: "8m ago" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="card-elevated rounded-xl p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-foreground font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{item.time}</span>
              </div>
            </motion.div>
          ))}
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
