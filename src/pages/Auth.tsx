import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/safestride-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignUp) {
      if (!name.trim()) { setError("Please enter your name"); setLoading(false); return; }
      const { error } = await signUp(email, password, name);
      if (error) { setError(error); setLoading(false); return; }
      navigate("/onboarding");
    } else {
      const { error } = await signIn(email, password);
      if (error) { setError(error); setLoading(false); return; }
      navigate("/home");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background gradient-bg-subtle flex flex-col relative overflow-hidden">
      {/* Ambient */}
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-primary/5 blur-3xl top-10 -left-20"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 4 }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-primary-glow/5 blur-3xl bottom-20 -right-10"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ repeat: Infinity, duration: 5, delay: 1 }}
      />

      {/* Header Logo */}
      <motion.div
        className="flex flex-col items-center pt-12 pb-6 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="h-20 w-20 rounded-2xl bg-card flex items-center justify-center glow-purple shadow-lg mb-4"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <img src={logo} alt="SafeStride" className="h-14 w-14 object-contain" />
        </motion.div>
        <h1 className="text-2xl font-display font-bold text-gradient-purple tracking-tight">SafeStride</h1>
        <p className="text-xs text-muted-foreground mt-1">Your AI safety companion</p>
      </motion.div>

      {/* Auth Form */}
      <motion.div
        className="flex-1 px-6 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Tab Toggle */}
        <div className="flex rounded-2xl bg-muted p-1 mb-6">
          <button
            onClick={() => { setIsSignUp(false); setError(""); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              !isSignUp ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsSignUp(true); setError(""); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isSignUp ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-card border-border text-sm"
                />
              </div>
            </motion.div>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-card border-border text-sm"
              required
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 rounded-xl bg-card border-border text-sm"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-xl"
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-purple text-primary-foreground font-semibold py-6 rounded-2xl glow-purple text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                {isSignUp ? "Creating account..." : "Signing in..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles size={16} />
                {isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight size={16} />
              </span>
            )}
          </Button>
        </form>

        {/* Security badge */}
        <motion.div
          className="flex items-center justify-center gap-2 mt-6 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Shield size={12} />
          <span className="text-[10px]">End-to-end encrypted • Your data stays private</span>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="p-5 z-10">
        <p className="text-[10px] text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;
