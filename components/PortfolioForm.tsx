"use client";

import { useEffect, useState } from "react";
import { Upload, ImagePlus, X, Plus, Film, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

export type PortfolioProjectData = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  tech: string[];
  image: string;
  gallery: string[];
  videos: string[];
  video_url: string;
  demo_url: string;
  github_url: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at?: string;
};

export type PortfolioFormValues = Omit<PortfolioProjectData, "id" | "created_at">;

type PortfolioFormProps = {
  initialData?: PortfolioProjectData;
  onSubmit: (values: PortfolioFormValues) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  submitLabel?: string;
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: "18px",
};

const sectionCard: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "16px",
  padding: "20px",
  background: "var(--bg-card)",
  display: "grid",
  gap: "16px",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "var(--text-primary)",
  marginBottom: "12px",
};

export default function PortfolioForm({
  initialData,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Save Project",
}: PortfolioFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [tech, setTech] = useState((initialData?.tech || []).join(", "));
  const [image, setImage] = useState(initialData?.image || "");
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);
  const [videos, setVideos] = useState<string[]>(initialData?.videos || []);
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || "");
  const [demoUrl, setDemoUrl] = useState(initialData?.demo_url || "");
  const [githubUrl, setGithubUrl] = useState(initialData?.github_url || "");
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 0);
  const [uploading, setUploading] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => {
      setTitle(initialData?.title || "");
      setTagline(initialData?.tagline || "");
      setDescription(initialData?.description || "");
      setCategory(initialData?.category || "");
      setTech((initialData?.tech || []).join(", "));
      setImage(initialData?.image || "");
      setGallery(initialData?.gallery || []);
      setVideos(initialData?.videos || []);
      setVideoUrl(initialData?.video_url || "");
      setDemoUrl(initialData?.demo_url || "");
      setGithubUrl(initialData?.github_url || "");
      setFeatured(initialData?.featured ?? false);
      setPublished(initialData?.published ?? false);
      setSortOrder(initialData?.sort_order ?? 0);
    }, 0);
    return () => window.clearTimeout(t);
  }, [initialData]);

  async function uploadFile(file: File, onUrl: (url: string) => void) {
    setUploading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/admin/portfolio/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token || ""}` },
        body: form,
      });
      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Upload failed.");
        return;
      }
      onUrl(json.url);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Something went wrong uploading the image.");
    } finally {
      setUploading(false);
    }
  }

  function addGalleryUrl() {
    const url = newGalleryUrl.trim();
    if (!url) return;
    setGallery((g) => [...g, url]);
    setNewGalleryUrl("");
  }

  function addVideoUrl() {
    const url = newVideoUrl.trim();
    if (!url) return;
    setVideos((v) => [...v, url]);
    setNewVideoUrl("");
  }

  function submit() {
    const values: PortfolioFormValues = {
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      category: category.trim(),
      tech: tech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      image: image.trim(),
      gallery: gallery.map((u) => u.trim()).filter(Boolean),
      videos: videos.map((u) => u.trim()).filter(Boolean),
      video_url: videoUrl.trim(),
      demo_url: demoUrl.trim(),
      github_url: githubUrl.trim(),
      featured,
      published,
      sort_order: Number(sortOrder) || 0,
    };
    void onSubmit(values);
  }

  const twoCol: React.CSSProperties = {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "1fr 1fr",
  };

  function MediaPreviewThumb({ src, onRemove, label }: { src: string; onRemove: () => void; label: string }) {
    return (
      <div
        style={{
          position: "relative",
          borderRadius: "10px",
          overflow: "hidden",
          border: "1px solid var(--border)",
          width: "100%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          style={{ width: "100%", height: 96, objectFit: "cover", display: "block" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = "0.35";
          }}
        />
        <button
          type="button"
          onClick={onRemove}
          title="Remove"
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "none",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div style={fieldStyle}>
      {/* ---------- Basic details ---------- */}
      <div style={sectionCard}>
        <div style={sectionTitle}>Project Details</div>

        <div>
          <label className="label">Project Title *</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Trios Flow CRM"
            autoFocus
          />
        </div>

        <div>
          <label className="label">Tagline</label>
          <input
            className="input"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Short one-liner shown under the title"
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you build? What was the outcome?"
            style={{ minHeight: "96px" }}
          />
        </div>

        <div style={twoCol}>
          <div>
            <label className="label">Category</label>
            <input
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Web App, Mobile, SaaS..."
            />
          </div>
          <div>
            <label className="label">Tech stack</label>
            <input
              className="input"
              value={tech}
              onChange={(e) => setTech(e.target.value)}
              placeholder="Next.js, React, Node.js (comma separated)"
            />
          </div>
        </div>
      </div>

      {/* ---------- Media ---------- */}
      <div style={sectionCard}>
        <div style={sectionTitle}>Media &amp; Links</div>

        <div>
          <label className="label">Cover image</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label
              className="btn"
              style={{ cursor: uploading ? "wait" : "pointer", flexShrink: 0 }}
            >
              {uploading ? (
                <span className="spinner" style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} />
              ) : (
                <Upload size={14} />
              )}
              &nbsp; Upload
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadFile(file, setImage);
                  e.target.value = "";
                }}
              />
            </label>
            <input
              className="input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="...or paste an image URL"
            />
          </div>
          {image ? (
            <div
              style={{
                position: "relative",
                marginTop: 12,
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid var(--border)",
                maxWidth: 360,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Cover preview"
                style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0.35";
                }}
              />
              <button
                type="button"
                onClick={() => setImage("")}
                title="Remove cover image"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              style={{
                marginTop: 12,
                border: "1px dashed var(--border)",
                borderRadius: "12px",
                padding: "18px",
                color: "var(--text-tertiary)",
                fontSize: 13,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <ImagePlus size={16} /> Upload or paste an image URL above.
            </div>
          )}
        </div>

        {/* Gallery */}
        <div>
          <label className="label">Gallery images</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
            <label className="btn" style={{ cursor: uploading ? "wait" : "pointer", flexShrink: 0 }}>
              {uploading ? (
                <span className="spinner" style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} />
              ) : (
                <ImagePlus size={14} />
              )}
              &nbsp; Add image
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadFile(file, (url) => setGallery((g) => [...g, url]));
                  e.target.value = "";
                }}
              />
            </label>
            <input
              className="input"
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addGalleryUrl();
                }
              }}
              placeholder="...or paste an image URL"
            />
            <button
              type="button"
              className="btn"
              onClick={addGalleryUrl}
              disabled={!newGalleryUrl.trim()}
              style={{ flexShrink: 0 }}
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {gallery.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginTop: 12 }}>
              {gallery.map((url, index) => (
                <MediaPreviewThumb
                  key={`${url}-${index}`}
                  src={url}
                  label={`Gallery image ${index + 1}`}
                  onRemove={() => setGallery((g) => g.filter((_, i) => i !== index))}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                marginTop: 12,
                border: "1px dashed var(--border)",
                borderRadius: "12px",
                padding: "14px",
                color: "var(--text-tertiary)",
                fontSize: 13,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <ImagePlus size={16} /> Add extra screenshots — they&apos;ll show as a slider on the website.
            </div>
          )}
        </div>

        {/* Videos */}
        <div>
          <label className="label">Videos</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
            <input
              className="input"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addVideoUrl();
                }
              }}
              placeholder="YouTube link or direct .mp4 URL"
            />
            <button
              type="button"
              className="btn"
              onClick={addVideoUrl}
              disabled={!newVideoUrl.trim()}
              style={{ flexShrink: 0 }}
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {videos.length > 0 ? (
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {videos.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    background: "var(--bg-input, rgba(255,255,255,0.4))",
                  }}
                >
                  <Film size={15} style={{ flexShrink: 0, color: "var(--text-tertiary)" }} />
                  <span
                    style={{ flex: 1, fontSize: 12.5, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={url}
                  >
                    {url}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVideos((v) => v.filter((_, i) => i !== index))}
                    title="Remove video"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: "none",
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                marginTop: 12,
                border: "1px dashed var(--border)",
                borderRadius: "12px",
                padding: "14px",
                color: "var(--text-tertiary)",
                fontSize: 13,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <LinkIcon size={16} /> Add a walkthrough or promo video.
            </div>
          )}
        </div>

        <div style={twoCol}>
          <div>
            <label className="label">Demo URL</label>
            <input
              className="input"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://... (Live Demo)"
            />
          </div>
          <div>
            <label className="label">GitHub URL</label>
            <input
              className="input"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
        </div>
      </div>

      {/* ---------- Publishing ---------- */}
      <div style={sectionCard}>
        <div style={sectionTitle}>Publishing</div>

        <div style={{ display: "grid", gap: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <span style={{ fontSize: 14 }}>Feature on homepage</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <span style={{ fontSize: 14 }}>Published (visible on the website)</span>
          </label>
          <div style={{ maxWidth: 200 }}>
            <label className="label">Sort order</label>
            <input
              className="input"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
        {onCancel ? (
          <button type="button" className="btn" onClick={onCancel} disabled={submitting} style={{ flex: 1 }}>
            Cancel
          </button>
        ) : null}

        <button
          type="button"
          className="btn btn-primary"
          onClick={submit}
          disabled={submitting || !title.trim()}
          style={{ flex: 1, opacity: !title.trim() ? 0.5 : 1 }}
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  );
}