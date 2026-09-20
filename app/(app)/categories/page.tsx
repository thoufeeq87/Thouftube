import { prisma } from "@/lib/db";
import CategoriesManager from "@/components/CategoriesManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Categories</h1>
      <CategoriesManager categories={categories} />
    </div>
  );
}
