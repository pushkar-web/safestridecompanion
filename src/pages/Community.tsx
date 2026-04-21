import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, MapPin, Plus, Send, X, Users, TrendingUp, Eye, ChevronDown, Flame, Lightbulb, Moon, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MUMBAI_LOCATIONS } from "@/lib/mumbai-coordinates";
import { useToast } from "@/hooks/use-toast";
import { useAwardPoints } from "@/hooks/use-points";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import logo from "@/assets/safestride-logo.png";

interface SafetyReport {
  id: string;
  created_at: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name: string | null;
  severity: string;
  upvotes: number;
  reporter_name: string | null;
}

const CATEGORIES = [
  { value: "poor_lighting", label: "Poor Lighting", icon: Moon, color: "hsl(var(--warning))" },
  { value: "harassment", label: "Harassment", icon: ShieldAlert, color: "hsl(var(--danger))" },
  { value: "unsafe_area", label: "Unsafe Area", icon: AlertTriangle, color: "hsl(var(--destructive))" },
  { value: "safe_spot", label: "Safe Spot", icon: Lightbulb, color: "hsl(var(--safe))" },
];

const SEVERITY_COLORS: Record<string, string> = {
  low: "hsl(var(--safe))",
  moderate: "hsl(var(--warning))",
  high: "hsl(var(--danger))",
  critical: "hsl(var(--destructive))",
};

export default function Community() {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("unsafe_area");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [locationName, setLocationName] = useState("");
  const [view, setView] = useState<"map" | "list">("map");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { toast } = useToast();
  const { award } = useAwardPoints();

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("safety_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data) setReports(data);
      setLoading(false);
    };
    fetchReports();

    // Realtime subscription
    const channel = supabase
      .channel("safety_reports_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "safety_reports" }, (payload) => {
        setReports((prev) => [payload.new as SafetyReport, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const markersRef = useRef<L.LayerGroup | null>(null);

  // Initialize map once
  useEffect(() => {
    if (view !== "map" || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false })
      .setView([19.076, 72.8777], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = null;
    };
  }, [view]);

  // Update markers when reports change
  useEffect(() => {
    if (!markersRef.current || !mapInstanceRef.current) return;

    markersRef.current.clearLayers();

    reports.forEach((report) => {
      const cat = CATEGORIES.find((c) => c.value === report.category);
      const color = report.category === "safe_spot" ? "hsl(155,75%,40%)" : (SEVERITY_COLORS[report.severity] || "hsl(0,80%,55%)");
      const size = report.severity === "critical" ? 20 : report.severity === "high" ? 16 : 12;

      const icon = L.divIcon({
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 ${size}px ${color}80;opacity:0.85"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        className: "",
      });

      L.marker([report.latitude, report.longitude], { icon })
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:160px">
            <strong style="color:${color}">${cat?.label || report.category}</strong>
            <p style="margin:4px 0;font-size:12px">${report.description}</p>
            <span style="font-size:10px;color:#888">${report.location_name || ""} · ${new Date(report.created_at).toLocaleDateString()}</span>
          </div>
        `)
        .addTo(markersRef.current!);
    });
  }, [reports]);

  const handleSubmit = async () => {
    if (!description.trim() || !locationName.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const locKey = locationName.toLowerCase().trim();
    const coords = MUMBAI_LOCATIONS[locKey];
    if (!coords) {
      toast({ title: "Location not found", description: "Try: Andheri, Bandra, Juhu, Kurla, etc.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("safety_reports").insert({
      category: selectedCategory,
      description: description.trim(),
      latitude: coords.lat + (Math.random() - 0.5) * 0.005,
      longitude: coords.lng + (Math.random() - 0.5) * 0.005,
      location_name: coords.name,
      severity,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to submit report", variant: "destructive" });
    } else {
      toast({ title: "Report submitted!", description: "Thank you for helping keep Mumbai safer." });
      await award("report_submitted");
      setShowForm(false);
      setDescription("");
      setLocationName("");
    }
  };

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="glass-card-strong sticky top-0 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="SafeStride" className="h-7 w-7" />
            <h1 className="text-lg font-bold font-display text-foreground">Community</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={view === "map" ? "default" : "outline"}
              onClick={() => setView("map")}
              className="h-8 px-3 text-xs"
            >
              <MapPin size={14} /> Map
            </Button>
            <Button
              size="sm"
              variant={view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
              className="h-8 px-3 text-xs"
            >
              <Eye size={14} /> Feed
            </Button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-3 flex gap-3">
        <div className="flex-1 glass-card rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-primary font-display">{reports.length}</div>
          <div className="text-[10px] text-muted-foreground">Reports</div>
        </div>
        <div className="flex-1 glass-card rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-primary font-display">
            {new Set(reports.map((r) => r.location_name)).size}
          </div>
          <div className="text-[10px] text-muted-foreground">Areas</div>
        </div>
        <div className="flex-1 glass-card rounded-xl p-3 text-center">
          <div className="text-xl font-bold font-display" style={{ color: "hsl(var(--safe))" }}>
            {reports.filter((r) => r.category === "safe_spot").length}
          </div>
          <div className="text-[10px] text-muted-foreground">Safe Spots</div>
        </div>
      </div>

      {/* Map or List View */}
      {view === "map" ? (
        <div className="px-4">
          <div ref={mapRef} className="w-full h-[45vh] rounded-2xl overflow-hidden border border-border shadow-lg" style={{ zIndex: 0 }} />
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.value} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                {cat.label}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No reports yet. Be the first!</div>
          ) : (
            reports.map((report, i) => {
              const cat = CATEGORIES.find((c) => c.value === report.category);
              const CatIcon = cat?.icon || AlertTriangle;
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="glass-card border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="p-2 rounded-xl shrink-0"
                          style={{ background: `${cat?.color || "hsl(var(--muted))"}20` }}
                        >
                          <CatIcon size={18} style={{ color: cat?.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-foreground">{cat?.label || report.category}</span>
                            <span className="text-[10px] text-muted-foreground">{timeAgo(report.created_at)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <MapPin size={10} className="text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">{report.location_name}</span>
                            <span
                              className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-medium"
                              style={{
                                background: `${SEVERITY_COLORS[report.severity] || "hsl(var(--muted))"}20`,
                                color: SEVERITY_COLORS[report.severity] || "hsl(var(--muted-foreground))",
                              }}
                            >
                              {report.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* FAB to add report */}
      <motion.button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full gradient-purple flex items-center justify-center shadow-xl"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <Plus size={24} className="text-primary-foreground" />
      </motion.button>

      {/* Report submission sheet */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div
              className="relative w-full max-w-md mx-auto glass-card-strong rounded-t-3xl p-5 pb-8"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-display text-foreground">Report an Area</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-full bg-muted">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Category selection */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {CATEGORIES.map((cat) => {
                  const CatIcon = cat.icon;
                  const isSelected = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all text-sm ${
                        isSelected
                          ? "border-primary bg-accent"
                          : "border-border bg-background hover:border-primary/30"
                      }`}
                    >
                      <CatIcon size={16} style={{ color: cat.color }} />
                      <span className={isSelected ? "text-primary font-medium" : "text-foreground"}>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Location */}
              <Input
                placeholder="Location (e.g., Andheri, Bandra)"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="mb-3"
              />

              {/* Description */}
              <Input
                placeholder="Describe what you observed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mb-3"
              />

              {/* Severity */}
              <div className="flex gap-2 mb-5">
                {["low", "moderate", "high", "critical"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                      severity === s
                        ? "border-primary bg-accent text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full gradient-purple text-primary-foreground h-12 rounded-xl font-semibold"
              >
                {submitting ? "Submitting..." : "Submit Report"}
                <Send size={16} />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
