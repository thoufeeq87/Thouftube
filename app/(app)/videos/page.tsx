import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/storage";
import CategoryFilterBar from "@/components/CategoryFilterBar";
import SensitiveMedia from "@/components/SensitiveMedia";

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { categoryId } = await searchParams;

  const [videos, categories] = await Promise.all([
    prisma.video.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const videosWithThumbs = await Promise.all(
    videos.map(async (video) => ({
      ...video,
      thumbnailUrl: video.thumbnailKey ? await getDownloadUrl(video.thumbnailKey) : null,
    }))
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Videos</h1>
        <Link
          href="/videos/upload"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Upload video
        </Link>
      </div>

      <CategoryFilterBar basePath="/videos" categories={categories} activeCategoryId={categoryId} />

      {videosWithThumbs.length === 0 ? (
        <p className="text-muted">No videos yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {videosWithThumbs.map((video) => {
            const thumbnail = (
              <div className="flex aspect-video items-center justify-center bg-black">
                {video.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">🎬</span>
                )}
              </div>
            );

            return (
              <div key={video.id} className="overflow-hidden rounded-lg border border-border bg-surface">
                {video.isSensitive ? (
                  <SensitiveMedia isSensitive label="Sensitive video">
                    {thumbnail}
                  </SensitiveMedia>
                ) : (
                  <Link href={`/videos/${video.id}`}>{thumbnail}</Link>
                )}
                <div className="p-3">
                  <Link href={`/videos/${video.id}`} className="line-clamp-1 font-medium hover:text-accent">
                    {video.title}
                  </Link>
                  {video.category && (
                    <p className="mt-1 text-xs text-muted">{video.category.name}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
