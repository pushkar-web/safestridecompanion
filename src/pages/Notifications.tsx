import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, BellOff, CheckCheck, Trash2, Shield, MapPin, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications, type AppNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";

const typeConfig: Record<AppNotification["type"], { icon: typeof Shield; color: string; bg: string }> = {
  safety: { icon: Shield, color: "text-primary", bg: "bg-primary/10" },
  trip: { icon: MapPin, color: "text-safe", bg: "bg-safe/10" },
  community: { icon: Users, color: "text-warning", bg: "bg-warning/10" },
  system: { icon: Zap, color: "text-muted-foreground", bg: "bg-accent" },
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } = useNotifications();

  return (
    <div className="min-h-screen bg-background pb-24 gradient-bg-subtle">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-foreground">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-display font-bold text-foreground">Notifications</h1>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-primary">
              <CheckCheck size={16} />
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-destructive">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 space-y-2.5">
        <AnimatePresence>
          {notifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                <BellOff size={28} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">You're all caught up! Safety alerts will appear here.</p>
            </motion.div>
          )}

          {notifications.map((notif, i) => {
            const config = typeConfig[notif.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => markAsRead(notif.id)}
                className={`card-interactive rounded-2xl p-4 cursor-pointer transition-all ${
                  !notif.read ? "border-l-4 border-l-primary" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    {notif.icon ? (
                      <span className="text-lg">{notif.icon}</span>
                    ) : (
                      <Icon size={18} className={config.color} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-semibold truncate ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">{timeAgo(notif.timestamp)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-bold uppercase`}>
                        {notif.type}
                      </span>
                      {!notif.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;
