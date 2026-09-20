"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import CategorySelect from "@/components/CategorySelect";
import SensitiveMedia from "@/components/SensitiveMedia";

type Video = {
  id: string;
  title: string;
  description: string | null;
  isSensitive: boolean;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  mimeType: string;
};

export default function VideoDetailClient({
  video,
  playbackUrl,
}: {
  video: Video;
  playbackUrl: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(video.categoryId);
  const [isSensitive, setIsSensitive] = useState(video.isSensitive);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, categoryId, isSensitive }),
      });
      if (!res.ok) throw new Error("Could not save changes");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this video? This cannot be undone.")) return;
    const res = await fetch(`/api/videos/${video.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/videos");
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl">
      <SensitiveMedia isSensitive={isSensitive} label="Sensitive video">
        <video controls className="w-full rounded-lg bg-black" src={playbackUrl} />
      </SensitiveMedia>

      {editing ? (
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Category</label>
            <CategorySelect value={categoryId} onChange={setCategoryId} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isSensitive}
              onChange={(e) => setIsSensitive(e.target.checked)}
              className="h-4 w-4"
            />
            Mark as sensitive (blurred until clicked)
          </label>
          {error && <p className="text-sm text-accent">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4">
          <h1 className="text-xl font-semibold">{video.title}</h1>
          {video.category && <p className="mt-1 text-sm text-muted">{video.category.name}</p>}
          {video.description && <p className="mt-3 whitespace-pre-wrap">{video.description}</p>}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md border border-border px-4 py-2 text-sm hover:border-accent"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border border-accent px-4 py-2 text-sm text-accent hover:bg-accent hover:text-white"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
