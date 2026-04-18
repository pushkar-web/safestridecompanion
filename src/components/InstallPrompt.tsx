import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Sparkles } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";

const DISMISS_KEY = "safestride_install_dismissed";

const InstallPrompt = () => {
  const { canInstall, install, isInstalled } = usePwaInstall();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!canInstall || isInstalled) {
      setShow(false);
      return;
    }
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < 3 * 24 * 3600 * 1000) return;
    const t = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(t);
  }, [canInstall, isInstalled]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  };

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-0 right-0 z-50 mx-auto max-w-md px-4"
        >
          <div className="glass-card-strong rounded-2xl p-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl gradient-purple flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-bold text-foreground">Install SafeStride</p>
              <p className="text-[11px] text-muted-foreground">Quick access from your home screen.</p>
            </div>
            <button
              onClick={handleInstall}
              className="px-3 h-9 rounded-xl gradient-purple text-primary-foreground text-xs font-bold flex items-center gap-1.5"
            >
              <Download size={12} /> Install
            </button>
            <button onClick={dismiss} className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-muted-foreground">
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
