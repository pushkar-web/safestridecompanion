import { NavLink, useLocation } from "react-router-dom";
import { Home, Flame, AlertOctagon, MessageCircle, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/heatmap", icon: Flame, label: "Heatmap" },
  { to: "/emergency", icon: AlertOctagon, label: "SOS", center: true },
  { to: "/chat", icon: MessageCircle, label: "AI Chat" },
  { to: "/leaderboard", icon: Trophy, label: "Ranks" },
];

const BottomNav = () => {
  const location = useLocation();

  if (["/", "/onboarding", "/debrief", "/auth", "/profile", "/active"].includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card-strong border-t-0 px-2 pb-safe">
      <div className="mx-auto flex max-w-md items-center justify-around py-1.5">
        {tabs.map(({ to, icon: Icon, label, center }) => {
          const isActive = location.pathname === to;
          if (center) {
            return (
              <NavLink key={to} to={to} className="relative -mt-7 flex flex-col items-center">
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className="h-14 w-14 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(0 80% 55%), hsl(355 75% 50%))",
                    boxShadow: "0 12px 30px -6px hsl(0 80% 55% / 0.5), 0 0 0 4px hsl(var(--background))",
                  }}
                >
                  <Icon size={24} className="text-destructive-foreground" />
                </motion.div>
                <span className="text-[9px] font-bold text-destructive mt-0.5">{label}</span>
              </NavLink>
            );
          }
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-col items-center gap-0.5 px-3 py-2"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full gradient-purple"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className={`relative p-1 rounded-xl transition-colors duration-200 ${
                isActive ? "bg-accent" : ""
              }`}>
                <Icon
                  size={20}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
