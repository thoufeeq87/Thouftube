import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteObject } from "@/lib/storage";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    description?: string | null;
    categoryId?: string | null;
    isSensitive?: boolean;
  };

  const photo = await prisma.photo.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.categoryId !== undefined && { categoryId: body.categoryId || null }),
      ...(body.isSensitive !== undefined && { isSensitive: body.isSensitive }),
    },
    include: { category: true },
  });

  return NextResponse.json(photo);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id } });

  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.photo.delete({ where: { id } });
  await deleteObject(photo.objectKey).catch((error) => {
    console.error(`Failed to delete storage object for photo ${id}:`, error);
  });

  return NextResponse.json({ ok: true });
}
