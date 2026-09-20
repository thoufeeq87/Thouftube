import Link from "next/link";
import { prisma } from "@/lib/db";
import CategoryFilterBar from "@/components/CategoryFilterBar";
import SensitiveMedia from "@/components/SensitiveMedia";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { categoryId } = await searchParams;

  const [posts, categories] = await Promise.all([
    prisma.post.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Link
          href="/posts/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          New post
        </Link>
      </div>

      <CategoryFilterBar basePath="/posts" categories={categories} activeCategoryId={categoryId} />

      {posts.length === 0 ? (
        <p className="text-muted">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="rounded-lg border border-border bg-surface p-4">
              <Link href={`/posts/${post.id}`} className="font-medium hover:text-accent">
                {post.title}
              </Link>
              {post.category && <p className="mt-1 text-xs text-muted">{post.category.name}</p>}
              <SensitiveMedia isSensitive={post.isSensitive} label="Sensitive post">
                <p className="mt-2 line-clamp-2 text-sm text-muted">{post.body}</p>
              </SensitiveMedia>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
