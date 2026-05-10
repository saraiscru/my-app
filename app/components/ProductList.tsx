"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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

const tagColors: Record<string, string> = {
  "Nou": "bg-green-100 text-green-700 border border-green-300",
  "Reducere": "bg-red-100 text-red-700 border border-red-300",
  "Popular": "bg-purple-100 text-purple-700 border border-purple-300",
  "Premium": "bg-yellow-100 text-yellow-700 border border-yellow-300",
  "Top Vânzări": "bg-orange-100 text-orange-700 border border-orange-300",
  "Gaming": "bg-blue-100 text-blue-700 border border-blue-300",
  "Stoc Limitat": "bg-pink-100 text-pink-700 border border-pink-300",
};

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

function CategoryItem({
  category,
  selectedId,
  onSelect,
  depth = 0,
}: {
  category: Category;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div style={{ paddingLeft: depth * 12 }}>
      <div
        className={`flex items-center gap-1 py-1 px-2 rounded-lg cursor-pointer text-sm transition-all ${
          selectedId === category.id
            ? "bg-blue-500 text-white font-semibold"
            : "text-gray-700 hover:bg-blue-50"
        }`}
        onClick={() => onSelect(selectedId === category.id ? null : category.id)}
      >
        {hasChildren && (
          <span
            className="text-xs w-4"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? "▼" : "▶"}
          </span>
        )}
        {!hasChildren && <span className="w-4" />}
        {category.name}
      </div>
      {hasChildren && open && (
        <div>
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductList({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter();
  const PRODUCTS_PER_PAGE = 9;

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>([0, 0]);
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(search), 200);
  return () => clearTimeout(timer);
}, [search]);

  const { data: categories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  useEffect(() => {
  const timer = setTimeout(() => setDebouncedPriceRange(priceRange), 500);
  return () => clearTimeout(timer);
}, [priceRange]);

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
      queryKey: ["tags"],
      queryFn: () => fetch("/api/tags").then((r) => r.json()),
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

  return (
    <div className="flex gap-6">
      <aside className="w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Categorii</h3>
          <div
            className={`py-1 px-2 rounded-lg cursor-pointer text-sm mb-2 transition-all ${
              selectedCategory === null ? "bg-blue-500 text-white font-semibold" : "text-gray-700 hover:bg-blue-50"
            }`}
            onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
          >
            Toate produsele
          </div>
          {tree.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              selectedId={selectedCategory}
              onSelect={(id) => { setSelectedCategory(id); setCurrentPage(1); }}
              depth={0}
            />
          ))}

          {/* Filtru preț */}
          {priceInitialized && globalMax > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Preț</h3>
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Min (RON)</label>
                  <input
                    type="number"
                    value={priceRange[0]}
                    min={globalMin}
                    max={priceRange[1]}
                    onChange={(e) => {
                      const val = Math.min(Math.max(Number(e.target.value), globalMin), priceRange[1]);
                      setPriceRange([val, priceRange[1]]);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Max (RON)</label>
                  <input
                    type="number"
                    value={priceRange[1]}
                    min={priceRange[0]}
                    max={globalMax}
                    onChange={(e) => {
                      const val = Math.max(Math.min(Number(e.target.value), globalMax), priceRange[0]);
                      setPriceRange([priceRange[0], val]);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
              <div className="relative h-6 flex items-center">
                <div className="absolute w-full h-1 bg-gray-200 rounded"></div>
                <div
                  className="absolute h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded"
                  style={{
                    left: `${((priceRange[0] - globalMin) / (globalMax - globalMin)) * 100}%`,
                    right: `${100 - ((priceRange[1] - globalMin) / (globalMax - globalMin)) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min={globalMin}
                  max={globalMax}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), priceRange[1]);
                    setPriceRange([val, priceRange[1]]);
                    setCurrentPage(1);
                  }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <input
                  type="range"
                  min={globalMin}
                  max={globalMax}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), priceRange[0]);
                    setPriceRange([priceRange[0], val]);
                    setCurrentPage(1);
                  }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{globalMin.toLocaleString("ro-RO")} RON</span>
                <span>{globalMax.toLocaleString("ro-RO")} RON</span>
              </div>
              <button
                onClick={() => { setPriceRange([globalMin, globalMax]); setCurrentPage(1); }}
                className="text-xs text-blue-500 hover:underline mt-2 block"
              >
                Reset preț
              </button>
            </div>
          )}

          {/* Filtru taguri */}
          {allTags.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Taguri</h3>
              <div className="flex flex-col gap-1">
                {(allTags as Tag[]).map((tag: Tag) => (
                  <label key={tag.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-blue-600">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => {
                        setSelectedTags((prev) => {
                          setCurrentPage(1);
                          return prev.includes(tag.id)
                            ? prev.filter((id) => id !== tag.id)
                            : [...prev, tag.id];
                        });
                      }}
                      className="accent-blue-500"
                    />
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColors[tag.name] || "bg-gray-100 text-gray-600"}`}>
                      {tag.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Lista produse */}
      <div className="flex-1">
        <div className="flex gap-3 mb-6">
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
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-2" />
                  ) : (
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                    >
                      Vezi detalii →
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => router.push(`/products/edit-product/${product.id}`)}
                        className="px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
                        title="Editează"
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Înapoi
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                  currentPage === page
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-blue-50"
                }`}
              >
                {page}
              </button>
            ))}
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