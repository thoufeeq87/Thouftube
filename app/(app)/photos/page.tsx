import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/storage";
import CategoryFilterBar from "@/components/CategoryFilterBar";
import SensitiveMedia from "@/components/SensitiveMedia";

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { categoryId } = await searchParams;

  const [photos, categories] = await Promise.all([
    prisma.photo.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const photosWithUrls = await Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      imageUrl: await getDownloadUrl(photo.objectKey),
    }))
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Photos</h1>
        <Link
          href="/photos/upload"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Upload photo
        </Link>
      </div>

      <CategoryFilterBar basePath="/photos" categories={categories} activeCategoryId={categoryId} />

      {photosWithUrls.length === 0 ? (
        <p className="text-muted">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photosWithUrls.map((photo) => {
            const thumbnail = (
              <div className="aspect-square bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="h-full w-full object-cover"
                />
              </div>
            );

            return (
              <div key={photo.id} className="overflow-hidden rounded-lg border border-border bg-surface">
                {photo.isSensitive ? (
                  <SensitiveMedia isSensitive label="Sensitive photo">
                    {thumbnail}
                  </SensitiveMedia>
                ) : (
                  <Link href={`/photos/${photo.id}`}>{thumbnail}</Link>
                )}
                <div className="p-3">
                  <Link href={`/photos/${photo.id}`} className="line-clamp-1 font-medium hover:text-accent">
                    {photo.title}
                  </Link>
                  {photo.category && (
                    <p className="mt-1 text-xs text-muted">{photo.category.name}</p>
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
