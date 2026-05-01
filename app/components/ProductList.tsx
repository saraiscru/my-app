"use client";

import { useState } from "react";

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

export default function ProductList({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const tree = buildTree(categories);

  // Gasim toate subcategoriile unei categorii selectate
  function getAllChildIds(categoryId: number, cats: Category[]): number[] {
    const result: number[] = [categoryId];
    const map: Record<number, Category> = {};
    cats.forEach((c) => (map[c.id] = c));

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

  const categoryIds = selectedCategory
    ? getAllChildIds(selectedCategory, categories)
    : null;

  let filtered = products.filter((p) => {
    const matchCategory = categoryIds ? categoryIds.includes(p.categoryId) : true;
    const normalize = (str: string) =>
     str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const matchSearch = normalize(p.name).includes(normalize(search));
    return matchCategory && matchSearch;
  });

  if (sortBy === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "name-asc") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === "name-desc") filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));

  return (
    <div className="flex gap-6">
      {/* Sidebar categorii */}
      <aside className="w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
            Categorii
          </h3>
          <div
            className={`py-1 px-2 rounded-lg cursor-pointer text-sm mb-2 transition-all ${
              selectedCategory === null
                ? "bg-blue-500 text-white font-semibold"
                : "text-gray-700 hover:bg-blue-50"
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            Toate produsele
          </div>
          {tree.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
              depth={0}
            />
          ))}
        </div>
      </aside>

      {/* Produse */}
      <div className="flex-1">
        {/* Bara de filtre */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Caută produse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="default">Sortare implicită</option>
            <option value="price-asc">Preț: mic → mare</option>
            <option value="price-desc">Preț: mare → mic</option>
            <option value="name-asc">Nume: A → Z</option>
            <option value="name-desc">Nume: Z → A</option>
          </select>
        </div>

        <p className="text-sm text-gray-500 mb-4">{filtered.length} produse găsite</p>

        {filtered.length === 0 ? (
          <p className="text-gray-500">Nu există produse pentru această selecție.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
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
                  <div className="flex gap-1 flex-wrap">
                    {product.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          tagColors[tag.name] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                    Vezi detalii →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}