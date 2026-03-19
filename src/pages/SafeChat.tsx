import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Shield, Scale, Siren, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import logo from "@/assets/safestride-logo.png";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  agentType?: string;
  agentName?: string;
  agentEmoji?: string;
  cached?: boolean;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/multi-agent`;

const AGENT_ICONS: Record<string, typeof Shield> = {
  safety_analyst: Shield,
  legal_advisor: Scale,
  emergency_coordinator: Siren,
  community_intelligence: Users,
  companion: Heart,
};

const AGENT_COLORS: Record<string, string> = {
  safety_analyst: "from-blue-500 to-cyan-500",
  legal_advisor: "from-amber-500 to-orange-500",
  emergency_coordinator: "from-red-500 to-rose-500",
  community_intelligence: "from-green-500 to-emerald-500",
  companion: "from-purple-500 to-pink-500",
};

const QUICK_PROMPTS = [
  { text: "Is Andheri safe at night?", agent: "safety_analyst" },
  { text: "What are my legal rights if harassed?", agent: "legal_advisor" },
  { text: "Emergency numbers in Mumbai", agent: "emergency_coordinator" },
  { text: "Tips for solo travel at night", agent: "companion" },
];

const FOLLOW_UP_SUGGESTIONS: Record<string, string[]> = {
  safety_analyst: ["What's the safest route?", "How about during daytime?", "Any police stations nearby?"],
  legal_advisor: ["How to file an FIR?", "What IPC sections apply?", "Where to get legal aid?"],
  emergency_coordinator: ["Nearest hospital?", "How to share live location?", "Self-defense tips?"],
  community_intelligence: ["Any recent reports nearby?", "Trending safety concerns?", "Safest areas in Mumbai?"],
  companion: ["How to stay confident?", "De-escalation techniques?", "Mental health resources?"],
};

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
  onAgentMeta,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
  onAgentMeta: (meta: { agent_type: string; agent_name: string; agent_emoji: string }) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages: messages.map(m => ({ role: m.role, content: m.content })) }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    onError(err.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) { onError("No response body"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx: number;
    while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIdx);
      buffer = buffer.slice(newlineIdx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        // Check for agent metadata
        if (parsed.agent_meta) {
          onAgentMeta(parsed.agent_meta);
          continue;
        }
        // Check for cached response
        if (parsed.cached) {
          onAgentMeta({ agent_type: parsed.agent_type, agent_name: parsed.agent_name, agent_emoji: parsed.agent_emoji });
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
          continue;
        }
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

export default function SafeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<{ type: string; name: string; emoji: string } | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const sessionId = useRef(crypto.randomUUID());

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      const { data } = await supabase
        .from("chat_history")
        .select("role, content, agent_type, metadata")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50);
      if (data && data.length > 0) {
        setMessages(data.map(d => ({
          role: d.role as "user" | "assistant",
          content: d.content,
          agentType: d.agent_type || undefined,
          agentName: (d.metadata as any)?.agent_name || undefined,
          agentEmoji: (d.metadata as any)?.agent_emoji || undefined,
        })));
      }
    };
    loadHistory();
  }, [user]);

  const persistMessage = async (msg: Message) => {
    if (!user) return;
    try {
      await supabase.from("chat_history").insert({
        user_id: user.id,
        session_id: sessionId.current,
        role: msg.role,
        content: msg.content,
        agent_type: msg.agentType || "companion",
        metadata: { agent_name: msg.agentName, agent_emoji: msg.agentEmoji },
      });
    } catch (e) { console.error("Failed to persist message:", e); }
  };

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setFollowUps([]);
    setCurrentAgent(null);
    persistMessage(userMsg);

    let assistantContent = "";
    let agentMeta = { type: "companion", name: "Safety Companion", emoji: "💜" };

    const upsert = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
        }
        return [...prev, { role: "assistant", content: assistantContent, agentType: agentMeta.type, agentName: agentMeta.name, agentEmoji: agentMeta.emoji }];
      });
    };

    await streamChat({
      messages: updatedMessages,
      onDelta: upsert,
      onAgentMeta: (meta) => {
        agentMeta = { type: meta.agent_type, name: meta.agent_name, emoji: meta.agent_emoji };
        setCurrentAgent(agentMeta);
      },
      onDone: () => {
        setIsLoading(false);
        setFollowUps(FOLLOW_UP_SUGGESTIONS[agentMeta.type] || []);
        const assistantMsg: Message = {
          role: "assistant", content: assistantContent,
          agentType: agentMeta.type, agentName: agentMeta.name, agentEmoji: agentMeta.emoji,
        };
        persistMessage(assistantMsg);
      },
      onError: (err) => {
        setIsLoading(false);
        toast({ title: "AI Error", description: err, variant: "destructive" });
      },
    });
  };

  const AgentBadge = ({ type, name }: { type: string; name: string }) => {
    const Icon = AGENT_ICONS[type] || Bot;
    const gradient = AGENT_COLORS[type] || "from-primary to-primary";
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white bg-gradient-to-r ${gradient}`}>
        <Icon size={10} />
        {name}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background pb-16">
      {/* Header */}
      <div className="glass-card-strong sticky top-0 z-40 px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <img src={logo} alt="SafeStride" className="h-7 w-7" />
          <div>
            <h1 className="text-lg font-bold font-display text-foreground">SafeChat AI</h1>
            <p className="text-[10px] text-muted-foreground">
              {currentAgent ? `${currentAgent.emoji} ${currentAgent.name} is responding` : "Multi-Agent Safety System"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full bg-accent">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-muted-foreground font-medium">5 Agents</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center pt-8">
            <div className="w-16 h-16 rounded-2xl gradient-purple flex items-center justify-center mb-4 shadow-lg">
              <Shield size={32} className="text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold font-display text-foreground mb-1">Multi-Agent Safety System</h2>
            <p className="text-xs text-muted-foreground text-center mb-4 max-w-[280px]">
              5 specialized AI agents work together — Safety Analyst, Legal Advisor, Emergency Coordinator, Community Intelligence & Companion.
            </p>

            {/* Agent pills */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-6">
              {Object.entries(AGENTS_DISPLAY).map(([type, { name, gradient }]) => {
                const Icon = AGENT_ICONS[type] || Bot;
                return (
                  <span key={type} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-white bg-gradient-to-r ${gradient}`}>
                    <Icon size={10} /> {name}
                  </span>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {QUICK_PROMPTS.map((prompt) => {
                const Icon = AGENT_ICONS[prompt.agent] || Sparkles;
                return (
                  <button
                    key={prompt.text}
                    onClick={() => send(prompt.text)}
                    className="text-left p-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors text-xs text-foreground"
                  >
                    <Icon size={12} className="text-primary mb-1" />
                    {prompt.text}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${AGENT_COLORS[msg.agentType || "companion"]} flex items-center justify-center shrink-0 mt-1`}>
                  {(() => { const Icon = AGENT_ICONS[msg.agentType || "companion"] || Bot; return <Icon size={14} className="text-white" />; })()}
                </div>
              )}
              <div className="max-w-[80%]">
                {msg.role === "assistant" && msg.agentName && (
                  <div className="mb-1">
                    <AgentBadge type={msg.agentType || "companion"} name={msg.agentName} />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border border-border rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1">
                  <User size={14} className="text-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${currentAgent ? AGENT_COLORS[currentAgent.type] : "from-purple-500 to-pink-500"} flex items-center justify-center shrink-0`}>
              {(() => { const Icon = currentAgent ? (AGENT_ICONS[currentAgent.type] || Bot) : Bot; return <Icon size={14} className="text-white" />; })()}
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                {currentAgent && <span className="text-[10px] text-muted-foreground">{currentAgent.emoji} {currentAgent.name} thinking...</span>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Follow-up suggestions */}
        {followUps.length > 0 && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 pt-2">
            {followUps.map((text) => (
              <button
                key={text}
                onClick={() => send(text)}
                className="px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 transition-colors text-xs text-foreground"
              >
                {text}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-16 glass-card-strong border-t border-border/50 px-4 py-3">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about safety in Mumbai..."
            disabled={isLoading}
            className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="h-10 w-10 rounded-xl gradient-purple shrink-0">
            <Send size={16} className="text-primary-foreground" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// Display data for empty state
const AGENTS_DISPLAY: Record<string, { name: string; gradient: string }> = {
  safety_analyst: { name: "Safety Analyst", gradient: "from-blue-500 to-cyan-500" },
  legal_advisor: { name: "Legal Advisor", gradient: "from-amber-500 to-orange-500" },
  emergency_coordinator: { name: "Emergency", gradient: "from-red-500 to-rose-500" },
  community_intelligence: { name: "Community Intel", gradient: "from-green-500 to-emerald-500" },
  companion: { name: "Companion", gradient: "from-purple-500 to-pink-500" },
};
