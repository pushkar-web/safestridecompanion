import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, Users, Link2, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrip } from "@/contexts/TripContext";
import { toast } from "@/hooks/use-toast";

const LiveSharePanel = () => {
  const { trip, emergencyContacts } = useTrip();
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  if (!trip) return null;

  const currentLat = ((trip.startLat + trip.endLat) / 2).toFixed(4);
  const currentLng = ((trip.startLng + trip.endLng) / 2).toFixed(4);
  const shareLink = `https://maps.google.com/?q=${currentLat},${currentLng}`;
  const shareMessage = `📍 I'm traveling from ${trip.routeFrom} to ${trip.routeTo}. Track my live location: ${shareLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    toast({ title: "Link copied!", description: "Share this with your trusted contacts" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartSharing = () => {
    setIsSharing(true);
    toast({
      title: "📍 Live sharing started",
      description: `Sharing with ${emergencyContacts.length} contacts`,
    });
  };

  const handleStopSharing = () => {
    setIsSharing(false);
    toast({ title: "Sharing stopped" });
  };

  const handleShareWhatsApp = () => {
    const phone = emergencyContacts[0]?.phone?.replace(/[^0-9]/g, "");
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(shareMessage)}`, "_blank");
    }
  };

  const handleShareSMS = () => {
    const phones = emergencyContacts.map((c) => c.phone).join(",");
    window.open(`sms:${phones}?body=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Live Location - SafeStride", text: shareMessage, url: shareLink });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <>
      {/* Floating Share Button */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className={`fixed bottom-24 right-4 z-40 h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
          isSharing
            ? "bg-safe text-primary-foreground glow-safe"
            : "gradient-purple text-primary-foreground glow-purple"
        }`}
        whileTap={{ scale: 0.92 }}
      >
        {isSharing ? <Users size={20} /> : <Share2 size={20} />}
        {isSharing && (
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-safe border-2 border-background status-dot" />
        )}
      </motion.button>

      {/* Share Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 right-4 left-4 z-50 max-w-md mx-auto"
          >
            <div className="card-elevated rounded-2xl p-4 border border-border shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg gradient-purple flex items-center justify-center">
                    <Share2 size={14} className="text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-display font-bold text-foreground">Live Location</p>
                    <p className="text-[10px] text-muted-foreground">
                      {isSharing ? "Sharing with contacts" : "Share your trip"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowPanel(false)} className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>

              {/* Status */}
              {isSharing && (
                <div className="flex items-center gap-2 bg-safe/10 rounded-xl px-3 py-2.5 mb-3 border border-safe/20">
                  <div className="h-2 w-2 rounded-full bg-safe status-dot" />
                  <span className="text-xs text-safe font-bold">Live sharing active</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {emergencyContacts.length} contacts
                  </span>
                </div>
              )}

              {/* Contacts */}
              <div className="mb-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">Sharing with</p>
                <div className="flex gap-2 flex-wrap">
                  {emergencyContacts.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-accent rounded-full px-3 py-1.5">
                      <div className="h-5 w-5 rounded-full gradient-purple flex items-center justify-center">
                        <span className="text-[9px] font-bold text-primary-foreground">{c.name[0]}</span>
                      </div>
                      <span className="text-xs font-medium text-foreground">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Link */}
              <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5 mb-3">
                <Link2 size={13} className="text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate flex-1">{shareLink}</span>
                <button
                  onClick={handleCopyLink}
                  className="h-7 w-7 rounded-lg bg-background flex items-center justify-center flex-shrink-0"
                >
                  {copied ? <Check size={12} className="text-safe" /> : <Copy size={12} className="text-foreground" />}
                </button>
              </div>

              {/* Share Actions */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-safe/10 text-safe rounded-xl py-2.5 text-xs font-semibold border border-safe/20"
                >
                  <MessageCircle size={14} /> WhatsApp
                </button>
                <button
                  onClick={handleShareSMS}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-primary/10 text-primary rounded-xl py-2.5 text-xs font-semibold border border-primary/20"
                >
                  <MessageCircle size={14} /> SMS
                </button>
                <button
                  onClick={handleNativeShare}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-accent text-accent-foreground rounded-xl py-2.5 text-xs font-semibold border border-border"
                >
                  <Share2 size={14} /> More
                </button>
              </div>

              {/* Toggle Sharing */}
              {isSharing ? (
                <Button
                  onClick={handleStopSharing}
                  variant="outline"
                  className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 text-xs h-10"
                >
                  Stop Sharing
                </Button>
              ) : (
                <Button
                  onClick={handleStartSharing}
                  className="w-full rounded-xl gradient-purple text-primary-foreground text-xs h-10 glow-purple"
                >
                  <Share2 size={14} className="mr-1.5" /> Start Live Sharing
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveSharePanel;
