import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Navigation, Shield, Clock, TrendingUp, Calendar, MapPin, Award, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface TripHistory {
  id: string;
  session_id: string;
  start_location: string | null;
  end_location: string | null;
  start_lat: number | null;
  start_lng: number | null;
  end_lat: number | null;
  end_lng: number | null;
  risk_score: number | null;
  risks_averted: number | null;
  duration_seconds: number | null;
  badge_title: string | null;
  badge_description: string | null;
  feedback: string | null;
  created_at: string;
}

interface Stats {
  totalTrips: number;
  totalDuration: number;
  avgRiskScore: number;
  totalRisksAverted: number;
  badgesEarned: number;
}

const TripHistoryPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripHistory[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTrips: 0,
    totalDuration: 0,
    avgRiskScore: 0,
    totalRisksAverted: 0,
    badgesEarned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<TripHistory | null>(null);

  useEffect(() => {
    fetchTripHistory();
  }, []);

  const fetchTripHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("trip_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const tripsData = data || [];
      setTrips(tripsData);

      // Calculate stats
      const totalTrips = tripsData.length;
      const totalDuration = tripsData.reduce((sum, t) => sum + (t.duration_seconds || 0), 0);
      const avgRiskScore = totalTrips > 0
        ? tripsData.reduce((sum, t) => sum + (t.risk_score || 0), 0) / totalTrips
        : 0;
      const totalRisksAverted = tripsData.reduce((sum, t) => sum + (t.risks_averted || 0), 0);
      const badgesEarned = tripsData.filter((t) => t.badge_title).length;

      setStats({
        totalTrips,
        totalDuration,
        avgRiskScore: Math.round(avgRiskScore),
        totalRisksAverted,
        badgesEarned,
      });
    } catch (err) {
      console.error("Failed to fetch trip history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const tripTimelineData = trips
    .slice(0, 10)
    .reverse()
    .map((trip, index) => ({
      name: format(new Date(trip.created_at), "MMM dd"),
      risk: trip.risk_score || 0,
      duration: Math.round((trip.duration_seconds || 0) / 60),
      index: index + 1,
    }));

  const riskDistributionData = [
    { name: "Low (0-30)", value: trips.filter((t) => (t.risk_score || 0) <= 30).length, color: "hsl(142 76% 36%)" },
    { name: "Medium (31-60)", value: trips.filter((t) => {
      const score = t.risk_score || 0;
      return score > 30 && score <= 60;
    }).length, color: "hsl(45 93% 47%)" },
    { name: "High (61-100)", value: trips.filter((t) => (t.risk_score || 0) > 60).length, color: "hsl(0 84% 60%)" },
  ].filter(d => d.value > 0);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-green-500";
    if (score <= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getRiskBg = (score: number) => {
    if (score <= 30) return "bg-green-500/10";
    if (score <= 60) return "bg-amber-500/10";
    return "bg-red-500/10";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 gradient-bg-subtle flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-lg gradient-purple animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 gradient-bg-subtle">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-foreground"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-display font-bold text-foreground">Trip History</h1>
        </div>
        <span className="text-[9px] px-2.5 py-1 rounded-full gradient-purple text-primary-foreground font-bold">
          {stats.totalTrips} TRIPS
        </span>
      </div>

      {/* Stats Overview */}
      <div className="px-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elevated rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Navigation size={16} className="text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Total Trips</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalTrips}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {formatDuration(stats.totalDuration)} traveled
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elevated rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Shield size={16} className="text-green-500" />
              </div>
              <span className="text-xs text-muted-foreground">Risks Averted</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalRisksAverted}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Safety incidents avoided
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-elevated rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <TrendingUp size={16} className="text-amber-500" />
              </div>
              <span className="text-xs text-muted-foreground">Avg Risk Score</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.avgRiskScore}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Out of 100 (lower is safer)
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-elevated rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Award size={16} className="text-purple-500" />
              </div>
              <span className="text-xs text-muted-foreground">Badges Earned</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.badgesEarned}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Achievement milestones
            </p>
          </motion.div>
        </div>
      </div>

      {/* Charts Section */}
      {trips.length > 0 && (
        <div className="px-4 pt-6">
          <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">
            Safety Analytics
          </h3>

          {/* Risk Timeline Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-elevated rounded-2xl p-4 mb-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Risk Score Timeline</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tripTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="risk"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Risk Distribution Pie Chart */}
          {riskDistributionData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card-elevated rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">Risk Distribution</span>
              </div>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {riskDistributionData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-[10px] text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Recent Trips List */}
      <div className="px-4 pt-6">
        <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">
          Recent Trips
        </h3>

        {trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-elevated rounded-2xl p-8 text-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <MapPin size={28} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">No trips yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Start planning your first safe journey
            </p>
            <Button
              onClick={() => navigate("/planner")}
              className="gradient-purple text-primary-foreground text-xs h-10 rounded-xl"
            >
              <Navigation size={14} className="mr-2" />
              Plan Your First Trip
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)}
                className="card-interactive rounded-2xl p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={12} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(trip.created_at), "MMM dd, yyyy • h:mm a")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-primary" />
                      <span className="text-sm font-semibold text-foreground">
                        {trip.start_location || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pl-6">
                      <Navigation size={12} className="text-muted-foreground rotate-90" />
                      <span className="text-xs text-muted-foreground">
                        to {trip.end_location || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-2.5 py-1 rounded-lg ${getRiskBg(trip.risk_score || 0)}`}>
                      <span className={`text-xs font-bold ${getRiskColor(trip.risk_score || 0)}`}>
                        Risk {trip.risk_score || 0}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDuration(trip.duration_seconds || 0)}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedTrip?.id === trip.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-muted rounded-xl p-2.5">
                        <p className="text-[10px] text-muted-foreground">Risks Averted</p>
                        <p className="text-lg font-bold text-foreground">
                          {trip.risks_averted || 0}
                        </p>
                      </div>
                      <div className="bg-muted rounded-xl p-2.5">
                        <p className="text-[10px] text-muted-foreground">Duration</p>
                        <p className="text-lg font-bold text-foreground">
                          {formatDuration(trip.duration_seconds || 0)}
                        </p>
                      </div>
                    </div>

                    {trip.badge_title && (
                      <div className="bg-purple-500/10 rounded-xl p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Award size={16} className="text-purple-500" />
                          <span className="text-sm font-semibold text-foreground">
                            {trip.badge_title}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {trip.badge_description}
                        </p>
                      </div>
                    )}

                    {trip.feedback && (
                      <div className="bg-muted rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground mb-1">Your Feedback</p>
                        <p className="text-xs text-foreground">{trip.feedback}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="flex items-center justify-center mt-2">
                  <ChevronRight
                    size={16}
                    className={`text-muted-foreground transition-transform ${
                      selectedTrip?.id === trip.id ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripHistoryPage;
