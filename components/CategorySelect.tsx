"use client";

import { useEffect, useState } from "react";

type Category = { id: string; name: string };

const NEW_CATEGORY_VALUE = "__new__";

export default function CategorySelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (categoryId: string | null) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const category: Category = await res.json();
      setCategories((prev) =>
        prev.some((c) => c.id === category.id) ? prev : [...prev, category].sort((a, b) => a.name.localeCompare(b.name))
      );
      onChange(category.id);
      setCreating(false);
      setNewName("");
    } finally {
      setBusy(false);
    }
  }

  if (creating) {
    return (
      <div className="flex gap-2">
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={busy || !newName.trim()}
          className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => {
            setCreating(false);
            setNewName("");
          }}
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        if (e.target.value === NEW_CATEGORY_VALUE) {
          setCreating(true);
          return;
        }
        onChange(e.target.value || null);
      }}
      className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-accent"
    >
      <option value="">No category</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
      <option value={NEW_CATEGORY_VALUE}>+ Add new category…</option>
    </select>
  );
}
