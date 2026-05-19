"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";


type Tag = {
  id: number;
  name: string;
};

type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

type Product = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  categoryId: number;
  imageUrl: string | null;
  category: Category;
  tags: Tag[];
};

const tagColors: Record<string, string> = {
  "Nou": "bg-green-100 text-green-700 border border-green-300",
  "Reducere": "bg-red-100 text-red-700 border border-red-300",
  "Popular": "bg-purple-100 text-purple-700 border border-purple-300",
  "Premium": "bg-yellow-100 text-yellow-700 border border-yellow-300",
  "Top Vânzări": "bg-orange-100 text-orange-700 border border-orange-300",
  "Gaming": "bg-blue-100 text-blue-700 border border-blue-300",
  "Stoc Limitat": "bg-pink-100 text-pink-700 border border-pink-300",
};

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
        {product.imageUrl ? (
         <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-2"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-6xl">
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
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
          {product.category.name}
        </p>
        <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 min-h-[48px]">
          {product.name}
        </h3>
        <p className="text-2xl font-bold text-blue-600 mb-3">
          {product.price.toLocaleString("ro-RO")}{" "}
          <span className="text-sm font-normal text-gray-500">RON</span>
        </p>
        <div className="flex gap-1 flex-wrap mb-3">
          {product.tags.map((tag) => (
            <span
              key={tag.id}
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColors[tag.name] || "bg-gray-100 text-gray-600"}`}
            >
              {tag.name}
            </span>
          ))}
        </div>
        <button
          onClick={() => router.push(`/products/${product.id}`)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
        >
          Vezi detalii →
        </button>
      </div>
    </div>
  );
}