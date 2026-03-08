import { motion } from "framer-motion";
import { ArrowLeft, Wifi, MapPin, Shield, Moon, Globe, ChevronRight, RefreshCw, Map, LogOut, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState({
    proximity: true,
    gps: true,
    fall: false,
  });
  const [darkMode, setDarkMode] = useState(false);

  const sensorItems = [
    { key: "proximity", icon: Wifi, label: "Proximity Sensor", desc: "Detect obstacles in real-time" },
    { key: "gps", icon: MapPin, label: "GPS Tracking", desc: "Monitor positioning & safety of geo..." },
    { key: "fall", icon: Shield, label: "Fall Detection", desc: "Detect potential falls or sudden mo..." },
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/home")} className="text-foreground">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-display font-bold text-foreground">Settings</h1>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">PRO</span>
      </div>

      {/* App Logo + Version */}
      <div className="flex flex-col items-center py-4">
        <div className="h-16 w-16 rounded-2xl gradient-purple flex items-center justify-center glow-purple mb-2">
          <Zap size={28} className="text-primary-foreground" />
        </div>
        <p className="text-sm font-display font-bold text-foreground">SafeStride</p>
        <p className="text-[10px] text-muted-foreground">Version 2.4.0 • Secured</p>
      </div>

      {/* Safety Sensors */}
      <div className="px-4 pt-2">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Safety Sensors</h3>
        <div className="space-y-2">
          {sensorItems.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-elevated rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} className="text-primary" />
                <div>
                  <p className="text-sm text-foreground font-medium">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Switch
                checked={sensors[item.key]}
                onCheckedChange={(v) => setSensors((s) => ({ ...s, [item.key]: v }))}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Offline Intelligence */}
      <div className="px-4 pt-5">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Offline Intelligence</h3>
        <div className="card-elevated rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Map size={18} className="text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Local Map Database</p>
              <p className="text-xs text-muted-foreground mt-1">
                Keep your safety maps updated even without an internet connection. Last sync: 4 hours ago.
              </p>
              <Button size="sm" className="gradient-purple text-primary-foreground text-xs h-8 mt-3 rounded-lg">
                <RefreshCw size={12} className="mr-1" /> Refresh Database
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="px-4 pt-5">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Preferences</h3>
        <div className="space-y-2">
          <div className="card-elevated rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-primary" />
              <div>
                <p className="text-sm text-foreground font-medium">Languages</p>
                <p className="text-[10px] text-muted-foreground">Choose your preferred app language</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-xs text-foreground font-medium">English</span>
              <ChevronRight size={14} />
            </div>
          </div>
          <div className="card-elevated rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={16} className="text-primary" />
              <div>
                <p className="text-sm text-foreground font-medium">Dark Mode</p>
                <p className="text-[10px] text-muted-foreground">
                  By turning on dark, the visibility, notifications, and safety will be prominently shown...
                </p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </div>
      </div>

      {/* Log Out */}
      <div className="px-4 pt-5">
        <button className="w-full text-center text-sm text-destructive font-medium py-3">
          <LogOut size={14} className="inline mr-2" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
