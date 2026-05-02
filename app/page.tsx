import { Suspense, lazy } from "react";

const ProductList = lazy(() => import("./components/ProductList"));

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">⚡ TechZone</h1>
            <p className="text-blue-100 text-sm mt-1">Cele mai bune electronice la prețuri imbatabile</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Toate produsele</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded mt-2"></div>
        </div>
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Se încarcă...</p>
            </div>
        </div>
}>
  <ProductList />
</Suspense>
      </main>
    </div>
  );
}