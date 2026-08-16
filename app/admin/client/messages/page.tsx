"use client";

import { useEffect, useState } from "react";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { getClientMessages, sendClientMessage } from "@/lib/messages";
import type { ClientUser, ClientMessage } from "@/lib/types/admin/client";

export default function ClientMessagesPage() {
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="bg-slate-900 p-8 rounded-xl">Loading messages…</div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div style={{ marginBottom: "20px" }}>
        <div className="section-label">Messages</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700 }}>
          Client communication
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Send a quick message to the team and track replies in one thread.
        </p>
      </div>

      <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
        {messages.length === 0 ? (
          <div style={{ color: "var(--text-tertiary)" }}>
            No messages yet. Use the form below to contact your account team.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {messages.map((message) => (
              <div key={message.id} className="card" style={{ padding: "18px", background: "var(--bg-surface)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
                  <div style={{ fontWeight: 700 }}>{message.sender === "client" ? "Your message" : "Admin reply"}</div>
                  <div style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>{new Date(message.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ color: "var(--text-primary)", lineHeight: 1.8 }}>{message.body}</div>
                {message.reply ? (
                  <div style={{ marginTop: "16px", padding: "14px", borderRadius: "14px", background: "rgba(59, 130, 246, 0.08)" }}>
                    <div style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "6px" }}>Team reply</div>
                    <div>{message.reply}</div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>New message</div>
        <textarea
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          placeholder="Ask your team about project progress, billing, or delivery"
          style={{ width: "100%", minHeight: "160px", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--bg-card)", padding: "14px", color: "var(--text-primary)", marginBottom: "14px" }}
        />
        <button onClick={handleSend} disabled={sending || !newMessage.trim()} className="btn btn-primary" style={{ padding: "12px 20px" }}>
          {sending ? "Sending…" : "Send message"}
        </button>
      </div>
    </div>
  );
}
