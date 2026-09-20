import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    body?: string;
    categoryId?: string | null;
    isSensitive?: boolean;
  };

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.body !== undefined && { body: body.body.trim() }),
      ...(body.categoryId !== undefined && { categoryId: body.categoryId || null }),
      ...(body.isSensitive !== undefined && { isSensitive: body.isSensitive }),
    },
    include: { category: true },
  });

  return NextResponse.json(post);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
