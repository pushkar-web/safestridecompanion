import { NavLink, useLocation } from "react-router-dom";
import { Home, Map, MessageCircle, Settings, Navigation } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/planner", icon: Map, label: "Route" },
  { to: "/chat", icon: MessageCircle, label: "SafeChat" },
  { to: "/trips", icon: Navigation, label: "Trips" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const BottomNav = () => {
  const location = useLocation();

  if (["/", "/onboarding", "/debrief"].includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card-strong border-t-0 px-2 pb-safe">
      <div className="mx-auto flex max-w-md items-center justify-around py-1.5">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
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
