import { motion } from "framer-motion";
import { ArrowLeft, Wifi, MapPin, Shield, Moon, Globe, ChevronRight, RefreshCw, Map, LogOut, Zap, UserPlus, Trash2, Phone, Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTrip, type EmergencyContact } from "@/contexts/TripContext";
import { toast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { emergencyContacts, setEmergencyContacts } = useTrip();
  const [sensors, setSensors] = useState({
    proximity: true,
    gps: true,
    fall: false,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [newContact, setNewContact] = useState<EmergencyContact>({ name: "", phone: "", email: "" });
  const [showAddContact, setShowAddContact] = useState(false);

  const sensorItems = [
    { key: "proximity", icon: Wifi, label: "Proximity Sensor", desc: "Detect obstacles in real-time" },
    { key: "gps", icon: MapPin, label: "GPS Tracking", desc: "Monitor positioning & safety of geo..." },
    { key: "fall", icon: Shield, label: "Fall Detection", desc: "Detect potential falls or sudden mo..." },
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

      {/* Emergency Contacts */}
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Emergency Contacts</h3>
          <button
            onClick={() => setShowAddContact(!showAddContact)}
            className="text-primary"
          >
            <UserPlus size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {emergencyContacts.map((contact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-elevated rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{contact.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium">{contact.name}</p>
                  <div className="flex items-center gap-2">
                    <Phone size={10} className="text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{contact.phone}</span>
                    {contact.email && (
                      <>
                        <Mail size={10} className="text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{contact.email}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => removeContact(i)} className="text-destructive p-1">
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Add Contact Form */}
        {showAddContact && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="card-elevated rounded-xl p-4 mt-2 space-y-2"
          >
            <Input
              placeholder="Name"
              value={newContact.name}
              onChange={(e) => setNewContact((c) => ({ ...c, name: e.target.value }))}
              className="text-sm"
            />
            <Input
              placeholder="Phone (e.g. +919876543210)"
              value={newContact.phone}
              onChange={(e) => setNewContact((c) => ({ ...c, phone: e.target.value }))}
              className="text-sm"
            />
            <Input
              placeholder="Email (optional)"
              value={newContact.email}
              onChange={(e) => setNewContact((c) => ({ ...c, email: e.target.value }))}
              className="text-sm"
            />
            <Button onClick={addContact} size="sm" className="w-full gradient-purple text-primary-foreground text-xs">
              Add Contact
            </Button>
          </motion.div>
        )}

        <p className="text-[10px] text-muted-foreground mt-2">
          SOS alerts will be sent via SMS, Email & WhatsApp to these contacts.
        </p>
      </div>

      {/* Safety Sensors */}
      <div className="px-4 pt-5">
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
