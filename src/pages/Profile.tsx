import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Save, User, Mail, Shield, Sparkles, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { user, displayName } = useAuth();
  const [name, setName] = useState(displayName || "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ trips: 0, safety: 100, badges: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, tripsRes, badgesRes] = await Promise.all([
        supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).single(),
        supabase.from("trip_history").select("risk_score").eq("user_id", user.id),
        supabase.from("badges").select("id").eq("user_id", user.id),
      ]);

      if (profileRes.data) {
        setName(profileRes.data.display_name || "");
        setAvatarUrl(profileRes.data.avatar_url || "");
      }
      const trips = tripsRes.data || [];
      const avgRisk = trips.length
        ? Math.round(trips.reduce((s, t) => s + (t.risk_score || 0), 0) / trips.length)
        : 0;
      setStats({
        trips: trips.length,
        safety: Math.max(0, 100 - avgRisk),
        badges: badgesRes.data?.length || 0,
      });
    };
    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name.trim(), avatar_url: avatarUrl.trim() || null })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } else {
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please pick an image", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({ title: "Avatar updated!", description: "Looking great ✨" });
    } catch (err) {
      console.error(err);
      toast({ title: "Upload failed", description: "Try again later", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setAvatarUrl("");
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    toast({ title: "Avatar removed" });
  };

  const initials = (name || user?.email || "U")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-[100px] -top-32 -right-32"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 8 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-5 relative z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-foreground">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-display font-bold text-foreground">Edit Profile</h1>
        </div>
      </div>

      {/* Avatar Section */}
      <motion.div
        className="flex flex-col items-center py-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative">
          <motion.div
            className="h-28 w-28 rounded-3xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: avatarUrl ? `url(${avatarUrl}) center/cover` : undefined,
              boxShadow: "0 16px 48px -12px hsl(var(--primary) / 0.3), 0 0 0 1px hsl(var(--primary) / 0.1)",
            }}
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            {!avatarUrl && (
              <div className="h-full w-full gradient-purple flex items-center justify-center">
                <span className="text-4xl font-bold text-primary-foreground">{initials}</span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
                <Loader2 size={28} className="text-primary animate-spin" />
              </div>
            )}
            <motion.div
              className="absolute -inset-3 rounded-[2rem] border border-primary/15 pointer-events-none"
              animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
          </motion.div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl gradient-purple flex items-center justify-center shadow-lg disabled:opacity-50"
            aria-label="Upload avatar"
          >
            <Camera size={16} className="text-primary-foreground" />
          </button>
          {avatarUrl && (
            <button
              onClick={handleRemoveAvatar}
              className="absolute -bottom-2 -left-2 h-10 w-10 rounded-xl bg-destructive/90 flex items-center justify-center shadow-lg"
              aria-label="Remove avatar"
            >
              <Trash2 size={14} className="text-destructive-foreground" />
            </button>
          )}
        </div>
        <p className="text-sm font-display font-bold text-foreground mt-4">{name || "Your Name"}</p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
          <Shield size={9} className="text-primary" /> Verified Member
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        className="px-5 space-y-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">
            Display Name
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="pl-10 h-12 rounded-xl bg-card/60 backdrop-blur-sm border-border/60 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">
            Email
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={user?.email || ""}
              disabled
              className="pl-10 h-12 rounded-xl bg-muted/50 border-border/40 text-sm text-muted-foreground"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full gradient-purple text-primary-foreground font-semibold rounded-2xl text-sm relative overflow-hidden"
          style={{
            height: 52,
            boxShadow: "0 8px 32px -8px hsl(var(--primary) / 0.4)",
          }}
        >
          {saving ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
          ) : (
            <span className="flex items-center gap-2">
              <Save size={16} /> Save Changes
            </span>
          )}
        </Button>

        {/* Stats Card */}
        <motion.div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(var(--primary-glow) / 0.04))",
            border: "1px solid hsl(var(--primary) / 0.1)",
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground">Your Safety Stats</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-display font-bold text-foreground">{stats.trips}</p>
              <p className="text-[9px] text-muted-foreground">Trips</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-display font-bold" style={{ color: "hsl(var(--safe))" }}>{stats.safety}%</p>
              <p className="text-[9px] text-muted-foreground">Safety</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-display font-bold text-foreground">{stats.badges}</p>
              <p className="text-[9px] text-muted-foreground">Badges</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
