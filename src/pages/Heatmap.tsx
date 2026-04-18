import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Layers, Clock, MapPin, Loader2, Shield, AlertTriangle, Heart } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type TimeFilter = "morning" | "afternoon" | "evening" | "night";

interface ZonePoint {
  id: string;
  lat: number;
  lng: number;
  severity: string;
  category: string;
  description: string;
  location_name?: string | null;
  upvotes?: number;
  source: "report" | "doc";
  title?: string;
}

const severityColor = (severity: string, time: TimeFilter) => {
  const base: Record<string, string> = {
    critical: "hsl(0 80% 55%)",
    high: "hsl(15 85% 55%)",
    moderate: "hsl(35 90% 55%)",
    low: "hsl(155 75% 45%)",
    safe: "hsl(155 75% 45%)",
  };
  if (time === "night" && severity !== "safe" && severity !== "low") {
    return "hsl(0 90% 55%)";
  }
  return base[severity] || "hsl(262 60% 60%)";
};

const severityRadius = (severity: string) => {
  if (severity === "critical") return 22;
  if (severity === "high") return 18;
  if (severity === "moderate") return 14;
  return 10;
};

const Heatmap = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ZonePoint[]>([]);
  const [docs, setDocs] = useState<ZonePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState<TimeFilter>("evening");
  const [layers, setLayers] = useState({
    reports: true,
    safe: true,
    police: true,
    hospital: true,
  });
  const [selected, setSelected] = useState<ZonePoint | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [r, d] = await Promise.all([
        supabase.from("safety_reports").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("safety_documents").select("*").not("latitude", "is", null).limit(200),
      ]);
      if (r.data) {
        setReports(
          r.data.map((x: any) => ({
            id: x.id,
            lat: x.latitude,
            lng: x.longitude,
            severity: x.severity,
            category: x.category,
            description: x.description,
            location_name: x.location_name,
            upvotes: x.upvotes,
            source: "report",
          }))
        );
      }
      if (d.data) {
        setDocs(
          d.data.map((x: any) => ({
            id: x.id,
            lat: x.latitude,
            lng: x.longitude,
            severity: x.category === "safe_haven" ? "safe" : x.category === "police_station" ? "low" : "low",
            category: x.category,
            description: x.content,
            location_name: x.location_name,
            title: x.title,
            source: "doc",
          }))
        );
      }
      setLoading(false);
    })();
  }, []);

  const visiblePoints = useMemo(() => {
    const out: ZonePoint[] = [];
    if (layers.reports) out.push(...reports);
    docs.forEach((d) => {
      if (d.category === "safe_haven" && layers.safe) out.push(d);
      else if (d.category === "police_station" && layers.police) out.push(d);
      else if (d.category === "hospital" && layers.hospital) out.push(d);
    });
    return out;
  }, [reports, docs, layers]);

  const handleSelect = async (p: ZonePoint) => {
    setSelected(p);
    setAiSummary("");
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("multi-agent", {
        body: {
          message: `Give a brief 2-sentence safety summary for ${p.location_name || "this area"} during ${time}. Context: ${p.description}`,
          context: { lat: p.lat, lng: p.lng, time_of_day: time },
          session_id: `heatmap_${p.id}`,
        },
      });
      if (!error && data) {
        setAiSummary(data.response || data.message || "Stay alert in this zone and keep emergency contacts ready.");
      } else {
        setAiSummary("Stay alert in this zone and keep emergency contacts ready.");
      }
    } catch {
      setAiSummary("Stay alert in this zone and keep emergency contacts ready.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[400] p-4 pt-5 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-xl glass-card flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="glass-card-strong rounded-2xl px-4 py-2">
          <p className="text-xs font-display font-bold text-foreground">Safety Heatmap</p>
          <p className="text-[9px] text-muted-foreground">{visiblePoints.length} live zones</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Map */}
      <div className="h-[60vh] w-full relative">
        {loading && (
          <div className="absolute inset-0 z-[300] flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        )}
        <MapContainer
          center={[19.076, 72.8777]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CartoDB'
          />
          {visiblePoints.map((p) => (
            <CircleMarker
              key={`${p.source}-${p.id}`}
              center={[p.lat, p.lng]}
              radius={severityRadius(p.severity)}
              pathOptions={{
                color: severityColor(p.severity, time),
                fillColor: severityColor(p.severity, time),
                fillOpacity: 0.4,
                weight: 1.5,
              }}
              eventHandlers={{ click: () => handleSelect(p) }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Time filter */}
      <div className="px-4 pt-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
          <Clock size={10} /> Time of Day
        </p>
        <div className="grid grid-cols-4 gap-2">
          {(["morning", "afternoon", "evening", "night"] as TimeFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTime(t)}
              className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                time === t
                  ? "gradient-purple text-primary-foreground shadow-md"
                  : "glass-card text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Layer toggles */}
      <div className="px-4 pt-3">
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
          <Layers size={10} /> Layers
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "reports" as const, label: "Reports", icon: AlertTriangle, color: "warning" },
            { key: "safe" as const, label: "Safe Spots", icon: Shield, color: "safe" },
            { key: "police" as const, label: "Police", icon: Shield, color: "primary" },
            { key: "hospital" as const, label: "Hospitals", icon: Heart, color: "destructive" },
          ].map((l) => (
            <button
              key={l.key}
              onClick={() => setLayers((s) => ({ ...s, [l.key]: !s[l.key] }))}
              className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                layers[l.key]
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "glass-card text-muted-foreground"
              }`}
            >
              <l.icon size={13} />
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI summary panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="fixed bottom-20 left-0 right-0 z-[500] mx-auto max-w-md px-4"
          >
            <div className="glass-card-strong rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: severityColor(selected.severity, time) + "22" }}
                >
                  <MapPin size={18} style={{ color: severityColor(selected.severity, time) }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-bold text-foreground truncate">
                    {selected.title || selected.location_name || "Zone"}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize">{selected.category.replace("_", " ")} · {selected.severity}</p>
                  <div className="mt-2 min-h-[40px]">
                    {aiLoading ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 size={12} className="animate-spin" /> AI analyzing zone…
                      </div>
                    ) : (
                      <p className="text-xs text-foreground leading-relaxed">{aiSummary}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground text-xl leading-none">
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Heatmap;
