import { Home, Map, MessageCircle, Navigation, Settings, Shield, Users, Bell, User, LogOut, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import logo from "@/assets/safestride-logo.png";

const navItems = [
  { to: "/home", icon: Home, label: "Dashboard" },
  { to: "/planner", icon: Map, label: "Route Planner" },
  { to: "/active", icon: Navigation, label: "Active Trip" },
  { to: "/chat", icon: MessageCircle, label: "SafeChat AI" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/trips", icon: Shield, label: "Trip History" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
];

const bottomItems = [
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppSidebar = ({ isOpen, onClose }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { displayName, signOut } = useAuth();
  const { unreadCount } = useNotifications();

  const handleNav = (to: string) => {
    navigate(to);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className="fixed top-0 left-0 bottom-0 w-72 bg-card/95 backdrop-blur-2xl z-50 border-r border-border/50 flex flex-col"
        initial={{ x: -288 }}
        animate={{ x: isOpen ? 0 : -288 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{
          boxShadow: isOpen ? "8px 0 40px -10px hsl(var(--primary) / 0.15)" : "none",
        }}
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-2xl bg-card flex items-center justify-center relative"
              style={{
                boxShadow: "0 8px 24px -6px hsl(var(--primary) / 0.25), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
              }}
            >
              <img src={logo} alt="SafeStride" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground text-sm">SafeStride</h2>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Sparkles size={8} className="text-primary" /> AI Safety Companion
              </p>
            </div>
          </div>

          {/* User info */}
          <div className="mt-4 p-3 rounded-xl bg-accent/50 border border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl gradient-purple flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">
                  {(displayName || "U")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{displayName || "User"}</p>
                <p className="text-[10px] text-muted-foreground">Premium Member</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.15em] px-3 mb-2">Navigation</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <button
                  key={item.to}
                  onClick={() => handleNav(item.to)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full gradient-purple"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.to === "/notifications" && unreadCount > 0 && (
                    <span className="ml-auto h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[9px] font-bold text-primary-foreground">{unreadCount > 9 ? "9+" : unreadCount}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="my-3 mx-3 h-px bg-border/50" />

          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.15em] px-3 mb-2">Account</p>
          <div className="space-y-1">
            {bottomItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <button
                  key={item.to}
                  onClick={() => handleNav(item.to)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sign Out */}
        <div className="p-3 border-t border-border/50">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default AppSidebar;
