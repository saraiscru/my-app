import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

const getProduct = cache(async (id: number) => {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true, tags: true },
  });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(Number(id));
  return {
    title: product ? `TechZone — ${product.name}` : "TechZone — Produs",
    description: product?.description || "Detalii produs TechZone.",
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) notFound();
  

  const tagColors: Record<string, string> = {
    "Nou": "bg-green-100 text-green-700 border border-green-300",
    "Reducere": "bg-red-100 text-red-700 border border-red-300",
    "Popular": "bg-purple-100 text-purple-700 border border-purple-300",
    "Premium": "bg-yellow-100 text-yellow-700 border border-yellow-300",
    "Top Vânzări": "bg-orange-100 text-orange-700 border border-orange-300",
    "Gaming": "bg-blue-100 text-blue-700 border border-blue-300",
    "Stoc Limitat": "bg-pink-100 text-pink-700 border border-pink-300",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">⚡ TechZone</Link>
          <Link href="/" className="bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/30 transition-all">
            ← Înapoi
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Imagine */}
            <div className="h-80 md:h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-9xl">
                  {product.category.name === "Smartphone-uri" ? "📱" :
                   product.category.name === "Tablete" ? "📟" :
                   product.category.name === "Laptopuri" ? "💻" :
                   product.category.name === "Desktop-uri" ? "🖥️" :
                   product.category.name === "Televizoare" ? "📺" :
                   product.category.name === "Căști" ? "🎧" :
                   product.category.name === "Console" ? "🎮" :
                   product.category.name === "Accesorii Gaming" ? "🕹️" :
                   product.category.name === "Frigidere" ? "🧊" :
                   product.category.name === "Mașini de spălat" ? "🫧" : "📦"}
                </span>
              )}
            </div>

            {/* Detalii */}
            <div className="p-8 flex flex-col gap-4">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                {product.category.name}
              </p>
              <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
              <p className="text-3xl font-bold text-blue-600">
                {product.price.toLocaleString("ro-RO")}{" "}
                <span className="text-base font-normal text-gray-500">RON</span>
              </p>

              {product.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {product.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${tagColors[tag.name] || "bg-gray-100 text-gray-600"}`}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {product.description && (
                <div
                  className="text-sm text-gray-600 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}