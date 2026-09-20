import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/storage";
import VideoDetailClient from "@/components/VideoDetailClient";

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await prisma.video.findUnique({ where: { id }, include: { category: true } });

  if (!video) {
    notFound();
  }

  const playbackUrl = await getDownloadUrl(video.objectKey);

  return <VideoDetailClient video={video} playbackUrl={playbackUrl} />;
}
