import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/storage";
import PhotoDetailClient from "@/components/PhotoDetailClient";

export default async function PhotoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id }, include: { category: true } });

  if (!photo) {
    notFound();
  }

  const imageUrl = await getDownloadUrl(photo.objectKey);

  return <PhotoDetailClient photo={photo} imageUrl={imageUrl} />;
}
