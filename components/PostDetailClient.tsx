"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import CategorySelect from "@/components/CategorySelect";
import SensitiveMedia from "@/components/SensitiveMedia";

type Post = {
  id: string;
  title: string;
  body: string;
  isSensitive: boolean;
  categoryId: string | null;
  category: { id: string; name: string } | null;
};

export default function PostDetailClient({ post }: { post: Post }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [categoryId, setCategoryId] = useState<string | null>(post.categoryId);
  const [isSensitive, setIsSensitive] = useState(post.isSensitive);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, categoryId, isSensitive }),
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
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/posts");
      router.refresh();
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="max-w-2xl space-y-4">
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
          <label className="mb-1 block text-sm text-muted">Text</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-accent"
            required
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
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">{post.title}</h1>
      {post.category && <p className="mt-1 text-sm text-muted">{post.category.name}</p>}
      <SensitiveMedia isSensitive={isSensitive} label="Sensitive post">
        <p className="mt-3 whitespace-pre-wrap">{post.body}</p>
      </SensitiveMedia>
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
  );
}
