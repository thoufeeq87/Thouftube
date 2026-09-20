import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PostDetailClient from "@/components/PostDetailClient";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, include: { category: true } });

  if (!post) {
    notFound();
  }

  return <PostDetailClient post={post} />;
}
