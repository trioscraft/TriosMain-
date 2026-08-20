"use client";

import { useEffect, useState } from "react";
import { Upload, ImagePlus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export type PortfolioProjectData = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  tech: string[];
  image: string;
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
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || "");
  const [demoUrl, setDemoUrl] = useState(initialData?.demo_url || "");
  const [githubUrl, setGithubUrl] = useState(initialData?.github_url || "");
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setTitle(initialData?.title || "");
      setTagline(initialData?.tagline || "");
      setDescription(initialData?.description || "");
      setCategory(initialData?.category || "");
      setTech((initialData?.tech || []).join(", "));
      setImage(initialData?.image || "");
      setVideoUrl(initialData?.video_url || "");
      setDemoUrl(initialData?.demo_url || "");
      setGithubUrl(initialData?.github_url || "");
      setFeatured(initialData?.featured ?? false);
      setPublished(initialData?.published ?? false);
      setSortOrder(initialData?.sort_order ?? 0);
    }, 0);
    return () => window.clearTimeout(t);
  }, [initialData]);

  async function handleUpload(file: File) {
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
      setImage(json.url);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Something went wrong uploading the image.");
    } finally {
      setUploading(false);
    }
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

  return (
    <div style={{ display: "grid", gap: "18px" }}>
      <div style={{ display: "grid", gap: "16px" }}>
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

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          background: "var(--bg-card)",
          display: "grid",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--text-primary)",
              marginBottom: "12px",
            }}
          >
            Media &amp; Links
          </div>

          <div>
            <label className="label">Image</label>
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
                    if (file) void handleUpload(file);
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
                  alt="Preview"
                  style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "0.35";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  title="Remove image"
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

          <div style={{ marginTop: 16 }}>
            <label className="label">Video URL (optional)</label>
            <input
              className="input"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/... or direct .mp4 link"
            />
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
      </div>

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