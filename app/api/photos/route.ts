import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/storage";

async function withImageUrl<T extends { objectKey: string }>(photo: T) {
  return { ...photo, imageUrl: await getDownloadUrl(photo.objectKey) };
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

  const photo = await prisma.photo.create({
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

  return NextResponse.json(await withImageUrl(photo), { status: 201 });
}
