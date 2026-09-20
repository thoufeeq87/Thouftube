import Link from "next/link";

export default function CategoryFilterBar({
  basePath,
  categories,
  activeCategoryId,
}: {
  basePath: string;
  categories: { id: string; name: string }[];
  activeCategoryId?: string;
}) {
  if (categories.length === 0) return null;

  const pillClass = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm transition ${
      active
        ? "border-accent bg-accent text-white"
        : "border-border text-muted hover:border-accent hover:text-foreground"
    }`;

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <Link href={basePath} className={pillClass(!activeCategoryId)}>
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`${basePath}?categoryId=${category.id}`}
          className={pillClass(activeCategoryId === category.id)}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
