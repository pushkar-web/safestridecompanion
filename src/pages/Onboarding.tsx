import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, UserPlus, Mic, ChevronRight, Lock, Plus, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
});

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
    <div className="min-h-screen bg-background gradient-bg-subtle flex flex-col relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/3 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10">
        <div className="flex items-center gap-1.5">
          <Shield className="text-primary" size={16} />
          <span className="text-xs font-display font-bold text-muted-foreground">SafeStride</span>
        </div>
        <button
          onClick={() => navigate("/home")}
          className="text-xs text-primary font-semibold px-3 py-1.5 rounded-full bg-accent hover:bg-accent/80 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Hero */}
      <motion.div
        className="flex flex-col items-center px-6 pt-4 pb-8 z-10"
        {...fadeUp(0)}
      >
        <motion.div
          className="mb-5 h-20 w-20 rounded-2xl gradient-purple flex items-center justify-center glow-purple floating"
        >
          <Shield size={36} className="text-primary-foreground" />
        </motion.div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2 tracking-tight">
          Welcome to <span className="text-gradient-purple">SafeStride</span>
        </h1>
        <p className="text-sm text-muted-foreground text-center max-w-[280px] leading-relaxed">
          Your personal AI safety companion. Empowering your journey with every step.
        </p>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-5 space-y-4 z-10">
        {/* Trusted Contacts */}
        <motion.div {...fadeUp(0.15)}>
          <h3 className="text-xs font-bold text-primary flex items-center gap-2 mb-3 uppercase tracking-wider">
            <UserPlus size={14} /> Trusted Contacts
          </h3>

          <div className="space-y-2.5">
            {contacts.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
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
                  className="flex-1 bg-card border-border text-sm h-11 rounded-xl"
                />
                <Input
                  placeholder="Phone Number"
                  value={c.phone}
                  onChange={(e) => {
                    const updated = [...contacts];
                    updated[i].phone = e.target.value;
                    setContacts(updated);
                  }}
                  className="flex-1 bg-card border-border text-sm h-11 rounded-xl"
                />
              </motion.div>
            ))}
          </div>

          <button
            onClick={addContact}
            className="flex items-center gap-1.5 text-xs text-primary font-semibold mt-2.5 hover:text-primary-glow transition-colors"
          >
            <Plus size={13} /> Add Another Contact
          </button>
        </motion.div>

        {/* Voice Activation */}
        <motion.div
          {...fadeUp(0.3)}
          className="card-interactive rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
              <Mic size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Voice Activation</p>
              <p className="text-xs text-muted-foreground">Trigger alerts with "Help Me"</p>
            </div>
          </div>
          <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
        </motion.div>

        {/* Privacy Badge */}
        <motion.div
          {...fadeUp(0.4)}
          className="glass-card rounded-2xl p-4 flex items-start gap-3"
        >
          <div className="h-9 w-9 rounded-lg bg-safe/10 flex items-center justify-center flex-shrink-0">
            <Lock size={16} className="text-safe" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              Privacy Pledge <Heart size={12} className="text-primary" />
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              Your data stays on-device and is never shared without your explicit command during an emergency.
            </p>
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div className="p-5 pb-8 z-10" {...fadeUp(0.5)}>
        <Button
          onClick={() => navigate("/home")}
          className="w-full gradient-purple text-primary-foreground font-semibold py-6 rounded-2xl glow-purple text-base"
        >
          <Sparkles size={18} className="mr-2" /> Complete Setup <ChevronRight size={18} className="ml-1" />
        </Button>
        <p className="text-[10px] text-center text-muted-foreground mt-3">
          By continuing, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
};

export default Onboarding;
