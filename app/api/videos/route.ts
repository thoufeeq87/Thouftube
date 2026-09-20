import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/storage";
import { generateVideoThumbnail } from "@/lib/thumbnail";

async function withThumbnailUrl<T extends { thumbnailKey: string | null }>(video: T) {
  return {
    ...video,
    thumbnailUrl: video.thumbnailKey ? await getDownloadUrl(video.thumbnailKey) : null,
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    title?: string;
    description?: string;
    objectKey?: string;
    mimeType?: string;
    sizeBytes?: number;
    categoryId?: string | null;
    isSensitive?: boolean;
  };

  if (!body.title?.trim() || !body.objectKey || !body.mimeType || !body.sizeBytes) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const video = await prisma.video.create({
    data: {
      title: body.title.trim(),
      description: body.description?.trim() || null,
      objectKey: body.objectKey,
      mimeType: body.mimeType,
      sizeBytes: body.sizeBytes,
      categoryId: body.categoryId || null,
      isSensitive: Boolean(body.isSensitive),
    },
    include: { category: true },
  });

  generateVideoThumbnail(video.objectKey)
    .then((thumbnailKey) =>
      prisma.video.update({ where: { id: video.id }, data: { thumbnailKey } })
    )
    .catch((error) => {
      console.error(`Thumbnail generation failed for video ${video.id}:`, error);
    });

  return NextResponse.json(await withThumbnailUrl(video), { status: 201 });
}
