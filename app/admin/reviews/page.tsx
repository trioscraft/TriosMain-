"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, MessageSquare, Trash2, Check, Eye, EyeOff, Star, Reply } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { PageHeader } from "@/components/admin/ui/Card";
import { EmptyState } from "@/components/admin/ui/Modal";
import Button from "@/components/admin/ui/Button";
import Badge from "@/components/admin/ui/Badge";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Modal } from "@/components/admin/ui/Modal";
import { Textarea } from "@/components/admin/ui/Field";

type Review = {
  id: string;
  name: string;
  company: string;
  rating: number;
  comment: string;
  approved: boolean;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";
      const res = await fetch("/api/admin/reviews", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (res.ok && json?.reviews) {
        setReviews(json.reviews as Review[]);
      }
    } catch {
      /* ignore network errors; keep previous list */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReviews();
  }, [loadReviews]);

  async function currentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let userId = user?.id ?? "";
    let userName = "Unknown";
    if (user?.email) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("email", user.email)
        .single();
      if (profile?.name) userName = profile.name;
    }
    return { userId, userName };
  }

  async function adminAuthHeaders(): Promise<Record<string, string>> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token || "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async function handleToggleApproved(review: Review) {
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: await adminAuthHeaders(),
      body: JSON.stringify({ id: review.id, approved: !review.approved }),
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      alert(d.error || "Failed to update review");
      return;
    }
    await loadReviews();
  }

  function openReply(review: Review) {
    setReplyTarget(review);
    setReplyText(review.reply || "");
  }

  async function handleSaveReply() {
    if (!replyTarget) return;
    setReplying(true);
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: await adminAuthHeaders(),
      body: JSON.stringify({
        id: replyTarget.id,
        reply: replyText.trim(),
        replied_at: replyText.trim() ? new Date().toISOString() : null,
      }),
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      alert(d.error || "Failed to save reply");
      setReplying(false);
      return;
    }
    const { userId, userName } = await currentUser();
    await logActivity({
      userId,
      userName,
      action: replyText.trim()
        ? `replied to review by ${replyTarget.name}`
        : `removed reply on review by ${replyTarget.name}`,
    });
    setReplyTarget(null);
    setReplying(false);
    await loadReviews();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/reviews?id=${deleteId}`, {
      method: "DELETE",
      headers: await adminAuthHeaders(),
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      alert(d.error || "Failed to delete review");
      setDeleting(false);
      return;
    }
    const removed = reviews.find((r) => r.id === deleteId);
    if (removed) {
      const { userId, userName } = await currentUser();
      await logActivity({ userId, userName, action: `deleted review by ${removed.name}` });
    }
    setReviews((current) => current.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
  }

  const filtered = reviews.filter((r) => {
    if (filter === "approved" && !r.approved) return false;
    if (filter === "pending" && r.approved) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      (r.company || "").toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q)
    );
  });

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "1000px", animation: "fadeUp 0.5s ease both" }}>
        <PageHeader
          title="Reviews"
          subtitle={`${reviews.length} review${reviews.length !== 1 ? "s" : ""} received · ${reviews.filter((r) => r.approved).length} visible on the website.`}
          icon={<MessageSquare size={22} />}
        />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 460 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input className="input" placeholder="Search name, company, or comment" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "approved", "pending"] as const).map((f) => (
              <button
                key={f}
                className="btn"
                onClick={() => setFilter(f)}
                style={{
                  padding: "8px 14px",
                  fontSize: 13,
                  borderColor: filter === f ? "var(--border-accent)" : "var(--border)",
                  background: filter === f ? "var(--accent-soft)" : "transparent",
                  color: filter === f ? "var(--accent)" : "var(--text-secondary)",
                  fontWeight: filter === f ? 600 : 400,
                }}
              >
                {f === "all" ? "All" : f === "approved" ? "Visible" : "Hidden"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: "grid", gap: 14 }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton" style={{ height: 120, animationDelay: `${index * 80}ms` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={24} />}
            title={search || filter !== "all" ? "No matching reviews" : "No reviews yet"}
            description={
              search || filter !== "all"
                ? "Adjust your search or filter."
                : "Reviews submitted through the website will appear here."
            }
          />
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {filtered.map((review) => (
              <div key={review.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 14, minWidth: 0, flex: 1 }}>
                    <Avatar name={review.name} size={42} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700 }}>{review.name}</span>
                        {review.company && (
                          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{review.company}</span>
                        )}
                        <Badge tone={review.approved ? "green" : "amber"} dot>
                          {review.approved ? "Visible" : "Hidden"}
                        </Badge>
                        {review.reply && <Badge tone="brass">Replied</Badge>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 8 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={13} fill={i < review.rating ? "var(--amber)" : "transparent"} color={i < review.rating ? "var(--amber)" : "var(--border)"} />
                        ))}
                        <span style={{ fontSize: 12, color: "var(--text-tertiary)", marginLeft: 6 }}>
                          {review.rating}/5
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-tertiary)", marginLeft: 12 }}>
                          {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, marginTop: 10 }}>&ldquo;{review.comment}&rdquo;</p>

                      {review.reply && (
                        <div
                          style={{
                            marginTop: 12,
                            borderLeft: "3px solid var(--accent)",
                            background: "var(--accent-soft)",
                            borderRadius: 10,
                            padding: "10px 14px",
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 4 }}>
                            Trios Craft · Reply
                          </div>
                          <div style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6 }}>{review.reply}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
                    <Button variant="ghost" size="sm" onClick={() => void handleToggleApproved(review)} leftIcon={review.approved ? <EyeOff size={14} /> : <Eye size={14} />}>
                      {review.approved ? "Hide" : "Show"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openReply(review)} leftIcon={review.reply ? <Check size={14} /> : <Reply size={14} />}>
                      {review.reply ? "Edit reply" : "Reply"}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleteId(review.id)} leftIcon={<Trash2 size={14} />}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {replyTarget && (
          <Modal open={Boolean(replyTarget)} onClose={() => setReplyTarget(null)} title="Reply to review" size="md" footer={null}>
            <div style={{ background: "var(--glass-bg)", borderRadius: 12, border: "1px solid var(--border)", padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                {replyTarget.name}
                {replyTarget.company ? ` · ${replyTarget.company}` : ""}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginTop: 6 }}>
                &ldquo;{replyTarget.comment}&rdquo;
              </div>
            </div>
            <label className="label">Reply (shown publicly on the website)</label>
            <Textarea
              rows={5}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Thanks for your feedback! ..."
              autoFocus
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <Button variant="ghost" onClick={() => setReplyTarget(null)} disabled={replying}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => void handleSaveReply()} loading={replying}>
                {replyText.trim() ? "Save Reply" : "Remove Reply"}
              </Button>
            </div>
          </Modal>
        )}

        <ConfirmDeleteModal
          open={Boolean(deleteId)}
          title="Delete review"
          description="This will permanently remove the review from the website. This action cannot be undone."
          confirmLabel="Delete review"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </RoleGuard>
  );
}