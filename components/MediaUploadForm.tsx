"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import CategorySelect from "@/components/CategorySelect";

export default function MediaUploadForm({ kind }: { kind: "video" | "photo" }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isSensitive, setIsSensitive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const accept = kind === "video" ? "video/*" : "image/*";
  const apiPath = kind === "video" ? "/api/videos" : "/api/photos";
  const listPath = kind === "video" ? "/videos" : "/photos";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Choose a file to upload");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      setStatus("Requesting upload URL...");
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, kind }),
      });
      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not get an upload URL");
      }
      const { url, key } = (await presignRes.json()) as { url: string; key: string };

      setStatus("Uploading file...");
      const putRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error("Uploading the file to storage failed");
      }

      setStatus("Saving...");
      const createRes = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          objectKey: key,
          mimeType: file.type,
          sizeBytes: file.size,
          categoryId,
          isSensitive,
        }),
      });
      if (!createRes.ok) {
        const data = await createRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not save the item");
      }
      const created = (await createRes.json()) as { id: string };

      router.push(`${listPath}/${created.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
      setStatus(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="file">
          {kind === "video" ? "Video file" : "Photo file"}
        </label>
        <input
          id="file"
          type="file"
          accept={accept}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
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
      {status && <p className="text-sm text-muted">{status}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
