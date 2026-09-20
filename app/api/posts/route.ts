import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    title?: string;
    body?: string;
    categoryId?: string | null;
    isSensitive?: boolean;
  };

  if (!body.title?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      title: body.title.trim(),
      body: body.body.trim(),
      categoryId: body.categoryId || null,
      isSensitive: Boolean(body.isSensitive),
    },
    include: { category: true },
  });

  return NextResponse.json(post, { status: 201 });
}
