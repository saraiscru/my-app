"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import ProductSidebar from "./ProductSidebar";

type Tag = {
  id: number;
  name: string;
};

type Category = {
  id: number;
  name: string;
  parentId: number | null;
  children?: Category[];
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

type ProductsResponse = {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  minPrice: number;
  maxPrice: number;
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

function buildTree(categories: Category[]): Category[] {
  const map: Record<number, Category> = {};
  const roots: Category[] = [];
  categories.forEach((cat) => {
    map[cat.id] = { ...cat, children: [] };
  });
  categories.forEach((cat) => {
    if (cat.parentId && map[cat.parentId]) {
      map[cat.parentId].children!.push(map[cat.id]);
    } else if (!cat.parentId) {
      roots.push(map[cat.id]);
    }
  });
  return roots;
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

export default function ProductList({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const PRODUCTS_PER_PAGE = 9;

  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ? Number(searchParams.get("category")) : null;

  const [selectedCategory, setSelectedCategory] = useState<number | null>(initialCategory);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>([0, 0]);
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPriceRange(priceRange), 500);
    return () => clearTimeout(timer);
  }, [priceRange]);

  const { data: categories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  function buildUrl() {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("limit", String(PRODUCTS_PER_PAGE));

    if (debouncedSearch) params.set("search", debouncedSearch);

    if (sortBy === "price-asc") { params.set("sortBy", "price"); params.set("sortOrder", "asc"); }
    else if (sortBy === "price-desc") { params.set("sortBy", "price"); params.set("sortOrder", "desc"); }
    else if (sortBy === "name-asc") { params.set("sortBy", "name"); params.set("sortOrder", "asc"); }
    else if (sortBy === "name-desc") { params.set("sortBy", "name"); params.set("sortOrder", "desc"); }
    else { params.set("sortBy", "createdAt"); params.set("sortOrder", "desc"); }

    if (selectedCategory && categories.length > 0) {
      const ids = getAllChildIds(selectedCategory, categories);
      ids.forEach((id) => params.append("categoryId", String(id)));
    }

    selectedTags.forEach((id) => params.append("tagId", String(id)));

    if (priceInitialized && debouncedPriceRange[0] > 0) params.set("minPrice", String(debouncedPriceRange[0]));
    if (priceInitialized && debouncedPriceRange[1] > 0) params.set("maxPrice", String(debouncedPriceRange[1]));

    return `/api/products?${params.toString()}`;
  }

  const { data, isLoading: loadingProducts } = useQuery<ProductsResponse>({
    queryKey: [
      "products",
      currentPage,
      debouncedSearch,
      selectedCategory,
      selectedTags,
      priceInitialized ? debouncedPriceRange : null,
      sortBy,
      categories.length,
    ],
    queryFn: () => fetch(buildUrl()).then((r) => r.json()),
    enabled: !loadingCategories,
  });

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const globalMin = data?.minPrice ?? 0;
  const globalMax = data?.maxPrice ?? 0;

  useEffect(() => {
    if (data && !priceInitialized && data.minPrice !== data.maxPrice) {
      setPriceRange([data.minPrice, data.maxPrice]);
      setDebouncedPriceRange([data.minPrice, data.maxPrice]);
      setPriceInitialized(true);
    }
  }, [data, priceInitialized]);

  const { data: allTags = [] } = useQuery<Tag[]>({
    queryKey: ["all-tags"],
    queryFn: () => fetch("/api/tags").then((r) => r.json()),
    enabled: !loadingCategories && !loadingProducts,
  });

  if (loadingProducts || loadingCategories) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Se încarcă produsele...</p>
        </div>
      </div>
    );
  }

  const tree = buildTree(categories);
  const hasActiveFilters = selectedCategory !== null || !!debouncedSearch || selectedTags.length > 0 || (priceInitialized && (priceRange[0] > globalMin || priceRange[1] < globalMax));

  const visiblePages = isMobile
    ? Array.from({ length: totalPages }, (_, i) => i + 1).filter(
        (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
      )
    : Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex gap-6 w-full min-w-0">
      <ProductSidebar
        tree={tree}
        allTags={allTags}
        selectedCategory={selectedCategory}
        selectedTags={selectedTags}
        priceRange={priceRange}
        globalMin={globalMin}
        globalMax={globalMax}
        priceInitialized={priceInitialized}
        sidebarOpen={sidebarOpen}
        hasActiveFilters={hasActiveFilters}
        onSelectCategory={(id) => { setSelectedCategory(id); setCurrentPage(1); }}
        onSelectTag={(id) => {
          setSelectedTags((prev) => {
            setCurrentPage(1);
            return prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id];
          });
        }}
        onPriceChange={(range) => { setPriceRange(range); setCurrentPage(1); }}
        onResetFilters={() => {
          setSelectedCategory(null);
          setSearch("");
          setDebouncedSearch("");
          setSelectedTags([]);
          setPriceRange([globalMin, globalMax]);
          setDebouncedPriceRange([globalMin, globalMax]);
          setCurrentPage(1);
          router.replace("/");
        }}
        onResetPrice={() => { setPriceRange([globalMin, globalMax]); setCurrentPage(1); }}
        onCloseSidebar={() => setSidebarOpen(false)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Caută produse..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="default">Sortare implicită</option>
            <option value="price-asc">Preț: mic → mare</option>
            <option value="price-desc">Preț: mare → mic</option>
            <option value="name-asc">Nume: A → Z</option>
            <option value="name-desc">Nume: Z → A</option>
          </select>
        </div>

        <p className="text-sm text-gray-500 mb-4">{total} produse găsite</p>

        {products.length === 0 ? (
          <p className="text-gray-500">Nu există produse pentru această selecție.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Înapoi
            </button>
            {visiblePages.map((page, idx) => {
              const prev = visiblePages[idx - 1];
              return (
                <span key={page} className="contents">
                  {prev && page - prev > 1 && (
                    <span className="text-gray-400 text-sm">…</span>
                  )}
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
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Înainte →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}