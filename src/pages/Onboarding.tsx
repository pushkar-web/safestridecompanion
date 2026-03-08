import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, UserPlus, Mic, ChevronRight, Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

const Onboarding = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([
    { name: "", phone: "" },
    { name: "", phone: "" },
  ]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const addContact = () => {
    setContacts([...contacts, { name: "", phone: "" }]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div />
        <button
          onClick={() => navigate("/home")}
          className="text-sm text-primary font-medium"
        >
          Skip
        </button>
      </div>

      {/* Hero */}
      <motion.div
        className="flex flex-col items-center px-6 pt-2 pb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-4 h-20 w-20 rounded-full bg-accent flex items-center justify-center">
          <Shield size={36} className="text-primary" />
        </div>
        <h1 className="text-xl font-display font-bold text-foreground mb-1">
          Welcome to SafeStride
        </h1>
        <p className="text-sm text-muted-foreground text-center max-w-[280px]">
          Your personal safety companion. Empowering your journey with every step.
        </p>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-5 space-y-5">
        {/* Trusted Contacts */}
        <div>
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
            <UserPlus size={16} /> Add Trusted Contacts
          </h3>

          <div className="space-y-3">
            {contacts.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Name"
                  value={c.name}
                  onChange={(e) => {
                    const updated = [...contacts];
                    updated[i].name = e.target.value;
                    setContacts(updated);
                  }}
                  className="flex-1 bg-card border-border text-sm"
                />
                <Input
                  placeholder="Phone Number"
                  value={c.phone}
                  onChange={(e) => {
                    const updated = [...contacts];
                    updated[i].phone = e.target.value;
                    setContacts(updated);
                  }}
                  className="flex-1 bg-card border-border text-sm"
                />
              </motion.div>
            ))}
          </div>

          <button
            onClick={addContact}
            className="flex items-center gap-1 text-sm text-primary font-medium mt-2"
          >
            <Plus size={14} /> Add Another Contact
          </button>
        </div>

        {/* Voice Activation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card-elevated rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Mic size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Voice Activation</p>
              <p className="text-xs text-muted-foreground">Trigger alerts with "Help Me"</p>
            </div>
          </div>
          <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
        </motion.div>

        {/* Privacy Badge */}
        <div className="card-elevated rounded-xl p-3 flex items-start gap-3">
          <Lock size={16} className="text-safe mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Privacy Pledge</p>
            <p className="text-xs text-muted-foreground">
              We prioritize your security. Your data stays on-device and is never shared with third-parties without your explicit command during an emergency.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-5 pb-8">
        <Button
          onClick={() => navigate("/home")}
          className="w-full gradient-purple text-primary-foreground font-semibold py-6 rounded-xl glow-purple"
        >
          Complete Setup <ChevronRight size={18} />
        </Button>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
