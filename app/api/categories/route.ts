import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const { name } = (await request.json()) as { name?: string };
  const trimmed = name?.trim();

  if (!trimmed) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { name: trimmed } });
  if (existing) {
    return NextResponse.json(existing);
  }

  const category = await prisma.category.create({ data: { name: trimmed } });
  return NextResponse.json(category, { status: 201 });
}
