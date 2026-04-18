import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Mic, Square, Shield, Heart, Building2, Loader2, MapPin, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTrip } from "@/contexts/TripContext";
import { toast } from "@/hooks/use-toast";

interface NearbyResource {
  id: string;
  title: string;
  category: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  distance?: number;
}

const tips = [
  { title: "Stay Calm", body: "Take 3 deep breaths. Panic clouds judgment. Your training is in your head — trust it." },
  { title: "Use Your Voice", body: "Yell 'FIRE' instead of 'HELP' — it gets faster attention from bystanders." },
  { title: "Aim for Vulnerable Spots", body: "Eyes, throat, knees. A short hard strike beats a long weak one." },
  { title: "Run Toward Lights", body: "Move toward crowded, well-lit spaces. Shops, hotels, police booths." },
  { title: "Share Your Location", body: "One tap on the SOS slider sends your live location to all emergency contacts." },
];

const distance = (a: [number, number], b: [number, number]) => {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const Emergency = () => {
  const navigate = useNavigate();
  const { triggerSOS, sosStatus, emergencyContacts, trip, startTrip } = useTrip();
  const [resources, setResources] = useState<NearbyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
      () => setUserLoc([19.076, 72.8777]),
      { timeout: 5000 }
    );
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("safety_documents")
        .select("id, title, category, location_name, latitude, longitude")
        .in("category", ["police_station", "hospital", "safe_haven"])
        .not("latitude", "is", null);
      if (data && userLoc) {
        const enriched = data.map((d: any) => ({
          ...d,
          distance: distance(userLoc, [d.latitude, d.longitude]),
        }));
        enriched.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setResources(enriched.slice(0, 8));
      } else if (data) {
        setResources(data.slice(0, 8) as any);
      }
      setLoading(false);
    })();
  }, [userLoc]);

  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % tips.length), 6000);
    return () => clearInterval(t);
  }, []);

  const ensureTrip = () => {
    if (!trip) startTrip("Current Location", "Emergency");
  };

  const handleSOS = async () => {
    ensureTrip();
    setTimeout(async () => {
      await triggerSOS();
      toast({ title: "🚨 SOS Sent", description: "Emergency contacts notified with your location." });
    }, 100);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunks.current = [];
      recorder.ondataavailable = (e) => chunks.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `evidence-${new Date().toISOString()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        stream.getTracks().forEach((t) => t.stop());
        toast({ title: "Evidence saved", description: "Recording downloaded to your device." });
      };
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (e) {
      toast({ title: "Microphone access denied", description: "Allow mic permission to record evidence.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const callNumber = (num: string) => {
    window.location.href = `tel:${num}`;
  };

  const speedDials = [
    { label: "Police", number: "100", icon: Shield, color: "primary" },
    { label: "Women Helpline", number: "181", icon: Phone, color: "primary" },
    { label: "Ambulance", number: "108", icon: Heart, color: "destructive" },
    { label: "Fire", number: "101", icon: Building2, color: "warning" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, hsl(0 80% 55% / 0.06), transparent 50%)" }}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-5 relative z-10">
        <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-xl glass-card flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-display font-bold text-foreground">Emergency Toolkit</h1>
        <div className="h-7 px-3 rounded-full bg-destructive/15 flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-destructive status-dot" />
          <span className="text-[10px] text-destructive font-bold">READY</span>
        </div>
      </div>

      {/* Big SOS button */}
      <div className="px-4 pt-6 flex flex-col items-center relative z-10">
        <motion.button
          onClick={handleSOS}
          disabled={sosStatus === "sending"}
          className="relative h-44 w-44 rounded-full gradient-purple flex flex-col items-center justify-center"
          style={{
            background: "linear-gradient(135deg, hsl(0 80% 55%), hsl(355 75% 50%))",
            boxShadow: "0 20px 60px -10px hsl(0 80% 55% / 0.5)",
          }}
          whileTap={{ scale: 0.96 }}
          animate={sosStatus === "idle" ? { scale: [1, 1.04, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "hsl(0 80% 55% / 0.25)" }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          {sosStatus === "sending" ? (
            <Loader2 size={48} className="text-primary-foreground animate-spin" />
          ) : (
            <>
              <Shield size={42} className="text-primary-foreground mb-1" />
              <span className="text-2xl font-display font-bold text-primary-foreground">SOS</span>
              <span className="text-[10px] text-primary-foreground/80 font-semibold">TAP TO ALERT</span>
            </>
          )}
        </motion.button>
        <p className="text-xs text-muted-foreground mt-4 text-center max-w-[260px]">
          One tap notifies <span className="text-foreground font-semibold">{emergencyContacts.length} emergency contact{emergencyContacts.length !== 1 ? "s" : ""}</span> via SMS, WhatsApp & email
        </p>
      </div>

      {/* Speed dial */}
      <div className="px-4 pt-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Speed Dial</h3>
        <div className="grid grid-cols-4 gap-2">
          {speedDials.map((s, i) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => callNumber(s.number)}
              className="card-interactive rounded-2xl p-3 flex flex-col items-center gap-1.5"
            >
              <div className={`h-10 w-10 rounded-xl bg-${s.color}/10 flex items-center justify-center`}>
                <s.icon size={18} className={`text-${s.color}`} />
              </div>
              <p className="text-[10px] font-bold text-foreground">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.number}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Evidence Recorder */}
      <div className="px-4 pt-5">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Evidence Recorder</h3>
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`w-full rounded-2xl p-4 flex items-center gap-3 transition-all ${
            recording ? "bg-destructive/10 border-2 border-destructive/30" : "card-interactive"
          }`}
        >
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${recording ? "bg-destructive" : "bg-accent"}`}>
            {recording ? <Square size={20} className="text-destructive-foreground" /> : <Mic size={20} className="text-primary" />}
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-display font-bold text-foreground">
              {recording ? "Recording…" : "Record Evidence"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {recording ? "Tap to stop & save audio" : "Audio is saved locally to your device"}
            </p>
          </div>
          {recording && (
            <motion.div
              className="h-3 w-3 rounded-full bg-destructive"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
        </button>
      </div>

      {/* Nearest resources */}
      <div className="px-4 pt-5">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Nearest Help</h3>
        {loading ? (
          <div className="text-center py-6">
            <Loader2 size={20} className="text-primary animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-2">
            {resources.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No nearby resources found.</p>
            )}
            {resources.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card-interactive rounded-2xl p-3 flex items-center gap-3"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  r.category === "police_station" ? "bg-primary/10" : r.category === "hospital" ? "bg-destructive/10" : "bg-safe/10"
                }`}>
                  {r.category === "hospital" ? (
                    <Heart size={16} className="text-destructive" />
                  ) : r.category === "police_station" ? (
                    <Shield size={16} className="text-primary" />
                  ) : (
                    <MapPin size={16} className="text-safe" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{r.title}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">
                    {r.category.replace("_", " ")}
                    {r.distance && ` · ${r.distance.toFixed(1)} km`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (r.latitude && r.longitude) {
                      window.open(`https://maps.google.com/?q=${r.latitude},${r.longitude}`, "_blank");
                    }
                  }}
                  className="h-8 px-3 rounded-lg bg-accent text-primary text-[10px] font-bold"
                >
                  Navigate
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Carousel */}
      <div className="px-4 pt-5">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Volume2 size={12} /> Self-Defense Tip
        </h3>
        <motion.div
          key={tipIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl p-4 gradient-purple"
          style={{ boxShadow: "0 12px 30px -10px hsl(var(--primary) / 0.3)" }}
        >
          <p className="text-sm font-display font-bold text-primary-foreground mb-1">{tips[tipIndex].title}</p>
          <p className="text-xs text-primary-foreground/85 leading-relaxed">{tips[tipIndex].body}</p>
          <div className="flex justify-center gap-1.5 mt-3">
            {tips.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${i === tipIndex ? "w-6 bg-primary-foreground" : "w-1 bg-primary-foreground/30"}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Emergency;
