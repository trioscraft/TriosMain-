"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import {
  createNotificationForAdmins,
} from "@/lib/admin/notifications";
import type { UserRole } from "@/lib/getCurrentUserRole";

type WikiPage = {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
};

type WikiVersion = {
  id: string;
  page_id: string;
  old_content: string | null;
  updated_by: string | null;
  updated_at: string;
};

function formatTimeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function WikiPageList({
  pages,
  selectedPageId,
  onSelect,
  onCreate,
  onDelete,
  search,
  setSearch,
}: {
  pages: WikiPage[];
  selectedPageId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 18,
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        height: "fit-content",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontFamily: "var(--font-display)" }}>Wiki</div>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 3 }}>Project knowledge base</div>
        </div>
        <button className="btn btn-primary" onClick={onCreate} style={{ padding: "10px 14px" }}>
          + New
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          className="input"
          placeholder="Search pages (title or content)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pages.length === 0 ? (
          <div style={{ padding: 14, color: "var(--text-tertiary)", textAlign: "center" }}>
            No wiki pages yet.
          </div>
        ) : (
          pages.map((p) => {
            const active = p.id === selectedPageId;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="btn"
                style={{
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "12px 12px",
                  background: active ? "var(--bg-elevated)" : "var(--bg-card)",
                  border: active ? "1px solid var(--border-accent)" : "1px solid var(--border)",
                }}
              >
                <span style={{ textAlign: "left", flex: 1 }}>
                  <span style={{ fontWeight: 700, display: "block" }}>{p.title}</span>
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    Updated {formatTimeAgo(p.updated_at)}
                  </span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    className="btn"
                    style={{ padding: "8px 10px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(p.id);
                    }}
                    title="Delete page"
                  >
                    🗑️
                  </button>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function WikiEditor({
  page,
  versionHistory,
  onSave,
  onRestore,
  saving,
}: {
  page: WikiPage | null;
  versionHistory: WikiVersion[];
  onSave: (newTitle: string, newContent: string) => void;
  onRestore: (oldContent: string | null) => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Sync editor fields from page selection.
  // (eslint-disable-next-line react-hooks/exhaustive-deps)
  if (page?.id) {
    // Note: no setState here; editor is initialized on selection via key remount.
  }

  // Auto-save (debounced)
  useEffect(() => {
    if (!page) return;
    const handle = window.setTimeout(() => {
      onSave(title, content);
    }, 600);
    return () => window.clearTimeout(handle);
  }, [title, content, onSave, page]);

  return (
    <div className="card" style={{ padding: 18, background: "var(--bg-surface)", border: "1px solid var(--border)", height: "fit-content" }}>
      {!page ? (
        <div style={{ padding: 16, color: "var(--text-tertiary)" }}>Select a wiki page to begin.</div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>{page.title}</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: 13, marginTop: 4 }}>
                Updated {formatTimeAgo(page.updated_at)}
              </div>
            </div>
            <div style={{ color: "var(--text-tertiary)", fontSize: 13 }}>{saving ? "Saving…" : ""}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 6 }}>
                Title
              </label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 6 }}>
                Content
              </label>
              <textarea
                className="input"
                style={{ minHeight: 260, resize: "vertical" }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Use Markdown or plain text. (Richer editor can be layered later.)"
              />
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ color: "var(--text-tertiary)", fontSize: 13 }}>
                Auto-save is enabled.
              </div>
              <button
                className="btn"
                onClick={() => onSave(title, content)}
                style={{ padding: "12px 18px" }}
              >
                Save now
              </button>
            </div>
          </div>

          <div style={{ marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: 12 }}>Version history</div>

            {versionHistory.length === 0 ? (
              <div style={{ color: "var(--text-tertiary)", padding: 10 }}>No versions yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {versionHistory.slice(0, 8).map((v) => (
                  <div
                    key={v.id}
                    className="card"
                    style={{
                      padding: 12,
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 700 }}>
                          {formatTimeAgo(v.updated_at)}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
                          Restore snapshot
                        </div>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => onRestore(v.old_content)}
                        style={{ padding: "10px 14px" }}
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function normalizeWikiContentForSave(v: string) {
  return v;
}

export default function ProjectWikiPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const searchParams = useSearchParams();

  const [pages, setPages] = useState<WikiPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [saving, setSaving] = useState(false);
  const [versionHistory, setVersionHistory] = useState<WikiVersion[]>([]);

  const selectedPage = useMemo(() => pages.find((p) => p.id === selectedPageId) ?? null, [pages, selectedPageId]);

  async function ensureDefaultPages() {
    const { data: existing, error } = await supabase
      .from("project_wiki_pages")
      .select("id,title")
      .eq("project_id", projectId);

    if (error) return;

    const existingTitles = new Set((existing || []).map((p) => String(p.title)));

    const defaults = [
      "Requirements",
      "Meeting Notes",
      "Deployment Notes",
      "API Documentation",
    ];

    const toInsert = defaults
      .filter((t) => !existingTitles.has(t))
      .map((title) => ({
        project_id: projectId,
        title,
        content: "",
      }));

    if (toInsert.length === 0) return;

    const {
      data: inserted,
      error: insertError,
    } = await supabase.from("project_wiki_pages").insert(toInsert).select("id,title");

    if (insertError) return;

    // activity + notifications will be triggered by the editor actions later;
    // default page insertion is silent.

    // select first page
    if (!selectedPageId && inserted && inserted.length > 0) {
      setSelectedPageId(inserted[0].id);
    }
  }

  async function loadPages() {
    setLoading(true);

    let query = supabase
      .from("project_wiki_pages")
      .select("id,project_id,title,content,created_at,updated_at")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });

    const q = search.trim();
    if (q) {
      query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    }

    const { data, error } = await query;

    if (error) {
      setPages([]);
      setLoading(false);
      return;
    }

    const list = data || [];
    setPages(list);

    if (!selectedPageId && list.length > 0) {
      setSelectedPageId(list[0].id);
    }

    setLoading(false);
  }

  async function loadVersions(pageId: string) {
    const { data, error } = await supabase
      .from("project_wiki_versions")
      .select("id,page_id,old_content,updated_by,updated_at")
      .eq("page_id", pageId)
      .order("updated_at", { ascending: false })
      .limit(30);

    if (error) {
      setVersionHistory([]);
      return;
    }

    setVersionHistory(data || []);
  }

  useEffect(() => {
    if (!projectId) return;

    void (async () => {
      await ensureDefaultPages();
      await loadPages();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    void (async () => {
      await loadPages();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (!selectedPageId) return;
    const t = window.setTimeout(() => {
      void loadVersions(selectedPageId);
    }, 0);

    return () => window.clearTimeout(t);
     
  }, [selectedPageId]);


  async function getUserIdentity() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id;
    let userName = user?.email ?? "Unknown";

    if (user?.email) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("email", user.email)
        .single();

      if (profile?.name) userName = profile.name;
    }

    return { userId: userId ?? "", userName };
  }

  async function createPage() {
    const title = prompt("Wiki page title?");
    if (!title || !title.trim()) return;

    const normalizedTitle = title.trim();

    setSaving(true);
    const { data: inserted, error } = await supabase
      .from("project_wiki_pages")
      .insert([
        {
          project_id: projectId,
          title: normalizedTitle,
          content: "",
        },
      ])
      .select("id,project_id,title,content,created_at,updated_at")
      .single();

    if (!error && inserted) {
      const { userId, userName } = await getUserIdentity();

      await logActivity({
        userId,
        userName,
        action: `Wiki page created ${normalizedTitle}`,
        projectId,
        projectName: undefined,
      });

      setSelectedPageId(inserted.id);
      await loadPages();
    }

    setSaving(false);
  }

  async function deletePage(pageId: string) {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;

    const ok = confirm(`Delete wiki page “${page.title}”?`);
    if (!ok) return;

    setSaving(true);

    const { error } = await supabase.from("project_wiki_pages").delete().eq("id", pageId);

    if (!error) {
      const { userId, userName } = await getUserIdentity();
      await logActivity({
        userId,
        userName,
        action: `Wiki page deleted ${page.title}`,
        projectId,
        projectName: undefined,
      });

      if (selectedPageId === pageId) setSelectedPageId(null);
      await loadPages();
    }

    setSaving(false);
  }

  async function savePage(newTitle: string, newContent: string) {
    if (!selectedPage) return;

    const normalizedTitle = newTitle.trim();
    if (!normalizedTitle) return;

    // Avoid churn
    if (normalizedTitle === selectedPage.title && newContent === (selectedPage.content ?? "")) {
      return;
    }

    setSaving(true);

    // Versioning: store previous content before update
    const oldContent = selectedPage.content ?? "";

    const { error: insertVersionError } = await supabase
      .from("project_wiki_versions")
      .insert([
        {
          page_id: selectedPage.id,
          old_content: oldContent,
          updated_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        },
      ]);

    if (insertVersionError) {
      // still attempt update
      console.warn("Failed to insert wiki version:", insertVersionError);
    }

    const { error: updateError } = await supabase
      .from("project_wiki_pages")
      .update({
        title: normalizedTitle,
        content: normalizeWikiContentForSave(newContent),
      })
      .eq("id", selectedPage.id);

    if (!updateError) {
      const { userId, userName } = await getUserIdentity();

      await logActivity({
        userId,
        userName,
        action: `Wiki page updated ${normalizedTitle}`,
        projectId,
        projectName: undefined,
      });

      await createNotificationForAdmins({
        title: "Wiki page updated",
        message: `“${normalizedTitle}” was updated in project wiki.`,
        type: "wiki",
        relatedId: `/admin/projects/${projectId}/wiki`,
      });

      await loadPages();
      await loadVersions(selectedPage.id);
    }

    setSaving(false);
  }

  async function restoreVersion(oldContent: string | null) {
    if (!selectedPage) return;

    setSaving(true);

    const oldCurrent = selectedPage.content ?? "";
    // store current before restore
    const { error: insertVersionError } = await supabase
      .from("project_wiki_versions")
      .insert([
        {
          page_id: selectedPage.id,
          old_content: oldCurrent,
          updated_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        },
      ]);

    if (insertVersionError) console.warn("Failed to insert wiki version before restore", insertVersionError);

    const { error: updateError } = await supabase
      .from("project_wiki_pages")
      .update({ content: oldContent ?? "" })
      .eq("id", selectedPage.id);

    if (!updateError) {
      const { userId, userName } = await getUserIdentity();

      await logActivity({
        userId,
        userName,
        action: `Wiki page restored ${selectedPage.title}`,
        projectId,
      });

      await createNotificationForAdmins({
        title: "Wiki page restored",
        message: `“${selectedPage.title}” was restored to a previous version.`,
        type: "wiki",
        relatedId: `/admin/projects/${projectId}/wiki`,
      });

      await loadPages();
      await loadVersions(selectedPage.id);
    }

    setSaving(false);
  }

  return (
    <RoleGuard allowedRoles={['admin','member','client'] as UserRole[]}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        <div>
          {loading ? (
            <div className="card" style={{ padding: 18, color: "var(--text-tertiary)" }}>Loading wiki…</div>
          ) : (
            <WikiPageList
              pages={pages}
              selectedPageId={selectedPageId}
              onSelect={(id) => setSelectedPageId(id)}
              onCreate={createPage}
              onDelete={deletePage}
              search={search}
              setSearch={(v) => setSearch(v)}
            />
          )}
        </div>

        <div>
          <WikiEditor
            page={selectedPage}
            versionHistory={versionHistory}
            onSave={savePage}
            onRestore={restoreVersion}
            saving={saving}
          />
        </div>
      </div>
    </RoleGuard>
  );
}

