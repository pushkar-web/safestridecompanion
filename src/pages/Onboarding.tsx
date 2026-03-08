import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, UserPlus, Mic, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const Onboarding = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([
    { name: "Contact Number 1", added: true },
    { name: "Contact Number 2", added: true },
  ]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Shield className="text-primary" size={20} />
          <span className="font-display font-bold text-foreground">SafeStride</span>
        </div>
        <button
          onClick={() => navigate("/home")}
          className="text-sm text-muted-foreground"
        >
          Skip
        </button>
      </div>

      {/* Hero */}
      <motion.div
        className="mx-4 rounded-2xl gradient-purple p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
          <Shield size={40} className="text-primary-foreground" />
        </div>
        <h1 className="text-xl font-display font-bold text-primary-foreground mb-2">
          Empowering Your Safety
        </h1>
        <p className="text-sm text-primary-foreground/80">
          Quickly set up your protection in Mumbai. Your safety is our priority.
        </p>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-4 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <UserPlus size={16} /> Add Trusted Contacts
        </h3>

        {contacts.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="glass-card rounded-xl p-3 flex items-center gap-3"
          >
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
              <UserPlus size={14} className="text-primary" />
            </div>
            <span className="text-sm text-foreground flex-1">{c.name}</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
              <Mic size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Voice Activation</p>
              <p className="text-xs text-muted-foreground">Trigger SOS with your voice</p>
            </div>
          </div>
          <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
        </motion.div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
          <Lock size={12} />
          <span>PRIVACY PLEDGE: YOUR DATA STAYS ON-DEVICE</span>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4 pb-8">
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
