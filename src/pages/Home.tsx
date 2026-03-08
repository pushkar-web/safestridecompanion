import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Shield, Mic, ChevronRight, MapPin, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);

  const handleVoice = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      navigate("/planner");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Shield className="text-primary" size={20} />
          <span className="font-display font-bold text-foreground">SafeStride</span>
        </div>
        <button className="relative">
          <Bell size={20} className="text-muted-foreground" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
        </button>
      </div>

      {/* Greeting */}
      <div className="px-4 pt-2">
        <motion.h1
          className="text-2xl font-display font-bold text-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Hello, Ananya
        </motion.h1>
        <p className="text-sm text-muted-foreground">Your safety is our priority today.</p>
      </div>

      {/* Status cards */}
      <div className="flex gap-3 px-4 pt-4">
        {[
          { icon: Zap, label: "STATUS", sublabel: "HISTORY" },
        ].map((_, i) => (
          <div key={i} className="flex gap-2 w-full">
            <button className="flex-1 glass-card rounded-xl p-3 text-center">
              <span className="text-xs text-muted-foreground">Status</span>
            </button>
            <button className="flex-1 glass-card rounded-xl p-3 text-center">
              <span className="text-xs text-muted-foreground">History</span>
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 px-4 pt-2">
        <div className="flex-1 glass-card rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Today's Risk</p>
          <p className="text-lg font-display font-bold text-safe">Low</p>
        </div>
        <div className="flex-1 glass-card rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Last Trip</p>
          <p className="text-lg font-display font-bold text-safe">Safe</p>
        </div>
      </div>

      {/* Plan Commute CTA */}
      <motion.div
        className="mx-4 mt-5 rounded-2xl gradient-purple p-5"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-display font-bold text-primary-foreground">
          Plan Commute
        </h2>
        <p className="text-sm text-primary-foreground/80 mb-3">
          Find the safest route to your destination
        </p>
        <Button
          onClick={() => navigate("/planner")}
          variant="secondary"
          className="bg-primary-foreground/20 text-primary-foreground border-0 hover:bg-primary-foreground/30"
        >
          Find Route <ChevronRight size={16} />
        </Button>
      </motion.div>

      {/* Voice CTA */}
      <div className="flex flex-col items-center pt-6">
        <motion.button
          onClick={handleVoice}
          className={`h-20 w-20 rounded-full flex items-center justify-center ${
            isListening ? "gradient-safe glow-safe" : "gradient-purple glow-purple"
          }`}
          animate={isListening ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Mic size={32} className="text-primary-foreground" />
        </motion.button>
        <h3 className="text-lg font-display font-semibold text-foreground mt-3">
          Speak Route
        </h3>
        <p className="text-xs text-muted-foreground">
          {isListening ? "Listening..." : '"Navigate me safely to Bandra West"'}
        </p>
      </div>

      {/* Recent Activity */}
      <div className="px-4 pt-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
        <div className="glass-card rounded-xl p-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <MapPin size={14} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground">Bandra to Worli</p>
            <p className="text-xs text-muted-foreground">24m ago</p>
          </div>
          <Clock size={14} className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default Home;
