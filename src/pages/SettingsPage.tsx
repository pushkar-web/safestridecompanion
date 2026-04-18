import { motion } from "framer-motion";
import { ArrowLeft, Wifi, MapPin, Shield, Moon, Globe, ChevronRight, RefreshCw, Map, LogOut, Zap, UserPlus, Trash2, Phone, Mail, Sparkles } from "lucide-react";
import logo from "@/assets/safestride-logo.png";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTrip, type EmergencyContact } from "@/contexts/TripContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useDarkMode } from "@/hooks/use-dark-mode";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { emergencyContacts, setEmergencyContacts } = useTrip();
  const { signOut, displayName } = useAuth();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const [sensors, setSensors] = useState({
    proximity: true,
    gps: true,
    fall: false,
  });
  const [newContact, setNewContact] = useState<EmergencyContact>({ name: "", phone: "", email: "" });
  const [showAddContact, setShowAddContact] = useState(false);

  const sensorItems = [
    { key: "proximity", icon: Wifi, label: "Proximity Sensor", desc: "Detect obstacles in real-time" },
    { key: "gps", icon: MapPin, label: "GPS Tracking", desc: "Monitor positioning & safety" },
    { key: "fall", icon: Shield, label: "Fall Detection", desc: "Detect potential falls or sudden motion" },
  ] as const;

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast({ title: "Missing info", description: "Name and phone are required", variant: "destructive" });
      return;
    }
    setEmergencyContacts([...emergencyContacts, newContact]);
    setNewContact({ name: "", phone: "", email: "" });
    setShowAddContact(false);
    toast({ title: "Contact added", description: `${newContact.name} added as emergency contact` });
  };

  const removeContact = (index: number) => {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    setEmergencyContacts(updated);
    toast({ title: "Contact removed" });
  };

  return (
    <div className="min-h-screen bg-background pb-24 gradient-bg-subtle">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/home")} className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-foreground">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-display font-bold text-foreground">Settings</h1>
        </div>
        <span className="text-[9px] px-2.5 py-1 rounded-full gradient-purple text-primary-foreground font-bold">PRO</span>
      </div>

      {/* App Logo + Version */}
      <motion.div
        className="flex flex-col items-center py-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="h-16 w-16 rounded-2xl bg-card flex items-center justify-center glow-purple shadow-lg mb-3 floating">
          <img src={logo} alt="SafeStride" className="h-11 w-11 object-contain" />
        </div>
        <p className="text-sm font-display font-bold text-foreground">SafeStride</p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Shield size={8} /> Version 2.4.0 • Secured
        </p>
      </motion.div>

      {/* Emergency Contacts */}
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Emergency Contacts</h3>
          <button
            onClick={() => setShowAddContact(!showAddContact)}
            className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-primary hover:bg-accent/80 transition-colors"
          >
            <UserPlus size={14} />
          </button>
        </div>

        <div className="space-y-2.5">
          {emergencyContacts.map((contact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-interactive rounded-2xl p-3.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl gradient-purple flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">{contact.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm text-foreground font-semibold">{contact.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Phone size={9} className="text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{contact.phone}</span>
                    {contact.email && (
                      <>
                        <Mail size={9} className="text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{contact.email}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => removeContact(i)} className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors">
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Add Contact Form */}
        {showAddContact && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="card-elevated rounded-2xl p-4 mt-3 space-y-2.5"
          >
            <Input
              placeholder="Name"
              value={newContact.name}
              onChange={(e) => setNewContact((c) => ({ ...c, name: e.target.value }))}
              className="text-sm h-11 rounded-xl"
            />
            <Input
              placeholder="Phone (e.g. +919876543210)"
              value={newContact.phone}
              onChange={(e) => setNewContact((c) => ({ ...c, phone: e.target.value }))}
              className="text-sm h-11 rounded-xl"
            />
            <Input
              placeholder="Email (optional)"
              value={newContact.email}
              onChange={(e) => setNewContact((c) => ({ ...c, email: e.target.value }))}
              className="text-sm h-11 rounded-xl"
            />
            <Button onClick={addContact} size="sm" className="w-full gradient-purple text-primary-foreground text-xs h-10 rounded-xl">
              Add Contact
            </Button>
          </motion.div>
        )}

        <p className="text-[10px] text-muted-foreground mt-2.5 flex items-center gap-1">
          <Sparkles size={9} /> SOS alerts sent via SMS, Email & WhatsApp
        </p>
      </div>

      {/* Safety Sensors */}
      <div className="px-4 pt-6">
        <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">Safety Sensors</h3>
        <div className="space-y-2.5">
          {sensorItems.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-interactive rounded-2xl p-3.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
                  <item.icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-semibold">{item.label}</p>
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
      <div className="px-4 pt-6">
        <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">Offline Intelligence</h3>
        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Map size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Local Map Database</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Keep safety maps updated offline. Last sync: 4 hours ago.
              </p>
              <Button size="sm" className="gradient-purple text-primary-foreground text-xs h-8 mt-3 rounded-xl">
                <RefreshCw size={12} className="mr-1.5" /> Refresh Database
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="px-4 pt-6">
        <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">Preferences</h3>
        <div className="space-y-2.5">
          <div className="card-interactive rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
                <Globe size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-foreground font-semibold">Languages</p>
                <p className="text-[10px] text-muted-foreground">Choose preferred language</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-xs text-foreground font-medium">English</span>
              <ChevronRight size={14} />
            </div>
          </div>
          <div className="card-interactive rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
                <Moon size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-foreground font-semibold">Dark Mode</p>
                <p className="text-[10px] text-muted-foreground">Enhanced night visibility</p>
              </div>
            </div>
            <Switch checked={isDark} onCheckedChange={toggleDark} />
          </div>
        </div>
      </div>

      {/* Log Out */}
      <div className="px-4 pt-6 pb-4">
        <button
          onClick={async () => { await signOut(); navigate("/auth"); }}
          className="w-full text-center text-sm text-destructive font-semibold py-3.5 rounded-2xl border-2 border-destructive/20 hover:bg-destructive/5 transition-colors"
        >
          <LogOut size={14} className="inline mr-2" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
