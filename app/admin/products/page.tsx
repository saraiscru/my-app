"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

type Tag = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  category: Category;
  tags: Tag[];
};

type ProductsResponse = {
  products: Product[];
  total: number;
  totalPages: number;
  page: number;
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function getAllChildIds(categoryId: number, cats: Category[]): number[] {
  const result: number[] = [categoryId];
  function findChildren(id: number) {
    cats.forEach((c) => {
      if (c.parentId === id) {
        result.push(c.id);
        findChildren(c.id);
      }
    });
  }
  findChildren(categoryId);
  return result;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [debouncedMinPrice, setDebouncedMinPrice] = useState("");
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, 400);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["admin-tags"],
    queryFn: () => fetch("/api/tags").then((r) => r.json()),
  });

  function buildUrl() {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("limit", String(LIMIT));
    if (selectedCategory && categories.length > 0) {
      const ids = getAllChildIds(Number(selectedCategory), categories);
      ids.forEach((id) => params.append("categoryId", String(id)));
    }
    if (selectedTag) params.append("tagId", selectedTag);
    if (debouncedMinPrice) params.set("minPrice", debouncedMinPrice);
    if (debouncedMaxPrice) params.set("maxPrice", debouncedMaxPrice);
    return `/api/products?${params.toString()}`;
  }

  const { data, isLoading } = useQuery<ProductsResponse>({
    queryKey: ["admin-products", currentPage, selectedCategory, selectedTag, debouncedMinPrice, debouncedMaxPrice],
    queryFn: () => fetch(buildUrl()).then((r) => r.json()),
  });

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const allSelected = products.length > 0 && products.every((p) => selectedIds.includes(p.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !products.map((p) => p.id).includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...products.map((p) => p.id)])]);
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ești sigur că vrei să ștergi acest produs?")) return;
    setDeletingId(id);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setDeletingId(null);
  };

  const handleDeleteSelected = async () => {
    const confirmed = confirm(
      `⚠️ Atenție! Ești pe cale să ștergi ${selectedIds.length} produse.\n\nAceastă acțiune este ireversibilă.\n\nApasă OK pentru a continua sau Anulează pentru a renunța.`
    );
    if (!confirmed) return;
    setDeletingAll(true);
    await Promise.all(selectedIds.map((id) => fetch(`/api/products/${id}`, { method: "DELETE" })));
    await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    setSelectedIds([]);
    setDeletingAll(false);
  };

  const visiblePages = isMobile
    ? Array.from({ length: totalPages }, (_, i) => i + 1).filter(
        (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
      )
    : Array.from({ length: totalPages }, (_, i) => i + 1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Produse</h1>
          <p className="text-sm text-gray-500 mt-1">{total} produse total</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deletingAll}
              className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {deletingAll ? "Se șterge..." : `🗑️ Șterge ${selectedIds.length}`}
            </button>
          )}
          <button
            onClick={() => router.push("/admin/products/add")}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            + Produs nou
          </button>
        </div>
      </div>

      {/* Filtre */}
      <div className="flex gap-3 mb-4 flex-wrap items-end">
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); setSelectedIds([]); }}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Toate categoriile</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={selectedTag}
          onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); setSelectedIds([]); }}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Toate tagurile</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Preț min"
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); setSelectedIds([]); }}
            className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <span className="text-gray-400 text-sm">—</span>
          <input
            type="number"
            placeholder="Preț max"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); setSelectedIds([]); }}
            className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {(selectedCategory || selectedTag || minPrice || maxPrice) && (
          <button
            onClick={() => { setSelectedCategory(""); setSelectedTag(""); setMinPrice(""); setMaxPrice(""); setCurrentPage(1); setSelectedIds([]); }}
            className="text-sm text-blue-500 hover:underline"
          >
            Reset filtre
          </button>
        )}
      </div>

      {/* Selectează tot - doar pe desktop */}
      <div className="hidden md:flex gap-2 mb-4 justify-end">
        <button
          onClick={toggleAll}
          className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
        >
          {allSelected ? "Deselectează tot" : "Selectează tot"}
        </button>
      </div>

      {/* ===== TABEL - doar pe desktop ===== */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-blue-500" />
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Produs</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categorie</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Preț</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Taguri</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-all ${selectedIds.includes(product.id) ? "bg-blue-50" : ""}`}>
                <td className="px-6 py-4">
                  <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleOne(product.id)} className="accent-blue-500" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-contain rounded-lg border border-gray-100" />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center text-lg">📦</div>
                    )}
                    <span className="text-sm font-medium text-gray-800">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium">{product.category.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-gray-800">{product.price.toLocaleString("ro-RO")} RON</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {product.tags.map((tag) => (
                      <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag.name}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => router.push(`/products/${product.id}`)} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">👁️ Vezi</button>
                    <button onClick={() => router.push(`/admin/products/edit/${product.id}`)} className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all">✏️ Editează</button>
                    <button onClick={() => handleDelete(product.id)} disabled={deletingId === product.id} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50">
                      {deletingId === product.id ? "..." : "🗑️ Șterge"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== CARDURI - doar pe mobil ===== */}
      <div className="md:hidden flex flex-col gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${selectedIds.includes(product.id) ? "border-blue-300 bg-blue-50" : "border-gray-100"}`}
          >
            <div className="flex items-center gap-3 mb-3">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-14 h-14 object-contain rounded-xl border border-gray-100 flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📦</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</p>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg font-medium">{product.category.name}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-blue-600">{product.price.toLocaleString("ro-RO")} RON</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {product.tags.map((tag) => (
                  <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag.name}</span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/products/${product.id}`)}
                className="flex-1 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                👁️ Vezi
              </button>
              <button
                onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                className="flex-1 py-2 text-xs font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all"
              >
                ✏️ Editează
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                disabled={deletingId === product.id}
                className="flex-1 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
              >
                {deletingId === product.id ? "..." : "🗑️ Șterge"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginare */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-blue-50 disabled:opacity-40 transition-all"
          >
            ← Înapoi
          </button>
          {visiblePages.map((page, idx) => {
            const prev = visiblePages[idx - 1];
            return (
              <span key={page} className="contents">
                {prev && page - prev > 1 && <span className="text-gray-400 text-sm">…</span>}
                <button
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    currentPage === page
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  {page}
                </button>
              </span>
            );
          })}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-blue-50 disabled:opacity-40 transition-all"
          >
            Înainte →
          </button>
        </div>
      )}
    </div>
  );
}