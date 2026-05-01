import { PrismaClient } from "@prisma/client";
import ProductList from "./components/ProductList";

const prisma = new PrismaClient();

export default async function Home() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      tags: true,
    },
  });

  const categories = await prisma.category.findMany();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">⚡ TechZone</h1>
            <p className="text-blue-100 text-sm mt-1">Cele mai bune electronice la prețuri imbatabile</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">{products.length} produse disponibile</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Toate produsele</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded mt-2"></div>
        </div>

        <ProductList products={products} categories={categories} />
      </main>
    </div>
  );
}