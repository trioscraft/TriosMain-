"use client";

import { useEffect, useRef, useState } from "react";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { getClientMessages, sendClientMessage } from "@/lib/messages";
import type { ClientUser, ClientMessage } from "@/lib/types/admin/client";
import { MessageSquare, Send, Sparkles } from "lucide-react";

export default function ClientMessagesPage() {
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      const currentClient = await getCurrentClientUser();
      if (!mounted || !currentClient) {
        setLoading(false);
        return;
      }

      setClientUser(currentClient);
      const clientMessages = await getClientMessages(currentClient.client_id);
      if (mounted) {
        setMessages(clientMessages);
        setLoading(false);
      }
    }

    void loadMessages();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!clientUser || !newMessage.trim()) return;

    setSending(true);
    const sent = await sendClientMessage(clientUser.id, clientUser.client_id, newMessage.trim());
    setSending(false);

    if (sent) {
      setMessages((current) => [...current, sent]);
      setNewMessage("");
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="cp-loading">
        <div className="cp-loading-spinner" />
        Loading messages...
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div className="cp-header">
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>
            Messages
          </div>
          <h1>Client communication</h1>
          <p>Send a quick message to the team and track replies in one thread.</p>
        </div>
      </div>

      <div className="cp-card" style={{ marginBottom: 20, padding: 0, overflow: "hidden" }}>
        {/* Thread header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "18px 22px",
            borderBottom: "1px solid var(--glass-border)",
            background: "linear-gradient(135deg, rgba(194,91,47,0.07), rgba(91,125,158,0.05))",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, var(--accent-bright), var(--accent))",
              color: "#fff7ee",
              boxShadow: "0 0 0 1px rgba(194,91,47,0.3), 0 8px 22px -6px var(--accent-glow)",
            }}
          >
            <Sparkles size={17} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>
              Trios Flow Team
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-secondary)", marginTop: 3 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green-glow)" }} />
              Account team · replies in one thread
            </div>
          </div>
        </div>

        {/* Thread */}
        <div ref={threadRef} className="cp-chat-thread" style={{ padding: "22px" }}>
          {messages.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "40px 24px",
                textAlign: "center",
                color: "var(--text-tertiary)",
                fontSize: 14,
              }}
            >
              <div className="cp-empty-icon">
                <MessageSquare size={24} />
              </div>
              No messages yet. Use the composer below to contact your account team.
            </div>
          ) : (
            messages.map((message) => {
              const isSent = message.sender === "client";
              return (
                <div key={message.id} className={`cp-bubble-row ${isSent ? "sent" : ""}`}>
                  <div
                    className={`cp-bubble-avatar ${isSent ? "client" : "team"}`}
                  >
                    {isSent ? "You" : "TF"}
                  </div>
                  <div style={{ maxWidth: "100%" }}>
                    <div className={`cp-bubble ${isSent ? "sent" : "received"}`}>
                      {message.body}
                      {message.reply ? (
                        <div
                          style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: isSent
                              ? "1px solid rgba(255,255,255,0.25)"
                              : "1px solid var(--glass-border)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              marginBottom: 6,
                              opacity: 0.75,
                            }}
                          >
                            Team reply
                          </div>
                          {message.reply}
                        </div>
                      ) : null}
                    </div>
                    <div className="cp-bubble-time">{formatTime(message.created_at)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="cp-card cp-composer">
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
          New message
        </div>
        <textarea
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your team about project progress, billing, or delivery"
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, gap: 10 }}>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
            Press Enter to send · Shift+Enter for a new line
          </span>
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="btn btn-primary"
            style={{ padding: "12px 22px" }}
          >
            <Send size={15} /> {sending ? "Sending..." : "Send message"}
          </button>
        </div>
      </div>
    </div>
  );
}