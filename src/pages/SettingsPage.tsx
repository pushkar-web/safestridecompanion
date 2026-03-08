import { motion } from "framer-motion";
import { ArrowLeft, Wifi, MapPin, Shield, Brain, Moon, Globe, ChevronRight, RefreshCw } from "lucide-react";
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
  const [darkMode, setDarkMode] = useState(true);

  const sensorItems = [
    { key: "proximity", icon: Wifi, label: "Proximity Sensors" },
    { key: "gps", icon: MapPin, label: "GPS Accuracy" },
    { key: "fall", icon: Shield, label: "Fall Detection" },
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate("/home")} className="text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-display font-bold text-foreground">Settings</h1>
      </div>

      {/* Safety Sensors */}
      <div className="px-4">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">SAFETY SENSORS</h3>
        <div className="space-y-2">
          {sensorItems.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} className="text-primary" />
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
              <Switch
                checked={sensors[item.key]}
                onCheckedChange={(v) => setSensors((s) => ({ ...s, [item.key]: v }))}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Intelligence */}
      <div className="px-4 pt-5">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">AI INTELLIGENCE</h3>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Brain size={18} className="text-primary mt-0.5" />
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
                  <RefreshCw size={12} className="mr-1" /> Refresh Database
                </Button>
                <span className="text-[10px] text-safe">Last sync: 2h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="px-4 pt-5">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">PREFERENCES</h3>
        <div className="space-y-2">
          <div className="glass-card rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={16} className="text-primary" />
              <span className="text-sm text-foreground">Dark Mode</span>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
          <div className="glass-card rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-primary" />
              <span className="text-sm text-foreground">Language</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-xs">Hindi available</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
