"use client";

import { useState } from "react";
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

const tagColors: Record<string, string> = {
  "Nou": "bg-green-100 text-green-700 border border-green-300",
  "Reducere": "bg-red-100 text-red-700 border border-red-300",
  "Popular": "bg-purple-100 text-purple-700 border border-purple-300",
  "Premium": "bg-yellow-100 text-yellow-700 border border-yellow-300",
  "Top Vânzări": "bg-orange-100 text-orange-700 border border-orange-300",
  "Gaming": "bg-blue-100 text-blue-700 border border-blue-300",
  "Stoc Limitat": "bg-pink-100 text-pink-700 border border-pink-300",
};

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

type Props = {
  tree: Category[];
  allTags: Tag[];
  selectedCategory: number | null;
  selectedTags: number[];
  priceRange: [number, number];
  globalMin: number;
  globalMax: number;
  priceInitialized: boolean;
  sidebarOpen: boolean;
  hasActiveFilters: boolean;
  onSelectCategory: (id: number | null) => void;
  onSelectTag: (id: number) => void;
  onPriceChange: (range: [number, number]) => void;
  onResetFilters: () => void;
  onResetPrice: () => void;
  onCloseSidebar: () => void;
  onToggleSidebar: () => void;
};

export default function ProductSidebar({
  tree,
  allTags,
  selectedCategory,
  selectedTags,
  priceRange,
  globalMin,
  globalMax,
  priceInitialized,
  sidebarOpen,
  hasActiveFilters,
  onSelectCategory,
  onSelectTag,
  onPriceChange,
  onResetFilters,
  onResetPrice,
  onCloseSidebar,
  onToggleSidebar,
}: Props) {
  const router = useRouter();

  return (
    <>
      {/* Buton hamburger - doar pe mobil */}
      <button
        className="md:hidden fixed bottom-20 right-4 z-50 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl rounded-full w-14 h-14 flex items-center justify-center text-xl border-2 border-white"
        onClick={onToggleSidebar}
        aria-label="Filtre"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={onCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-40 overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:h-auto md:w-64 md:flex-shrink-0 md:overflow-visible
        `}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Categorii</h3>
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="text-xs text-red-500 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-lg transition-all font-medium"
              >
                ✕ Reset filtre
              </button>
            )}
          </div>

          <div
            className={`py-1 px-2 rounded-lg cursor-pointer text-sm mb-2 transition-all ${
              selectedCategory === null ? "bg-blue-500 text-white font-semibold" : "text-gray-700 hover:bg-blue-50"
            }`}
            onClick={() => {
              onSelectCategory(null);
              router.replace("/");
              onCloseSidebar();
            }}
          >
            Toate produsele
          </div>

          {tree.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              selectedId={selectedCategory}
              onSelect={(id) => {
                onSelectCategory(id);
                onCloseSidebar();
              }}
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
                      onPriceChange([val, priceRange[1]]);
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
                      onPriceChange([priceRange[0], val]);
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
                    onPriceChange([val, priceRange[1]]);
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
                    onPriceChange([priceRange[0], val]);
                  }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{globalMin.toLocaleString("ro-RO")} RON</span>
                <span>{globalMax.toLocaleString("ro-RO")} RON</span>
              </div>
              <button
                onClick={onResetPrice}
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
                {allTags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-blue-600">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => onSelectTag(tag.id)}
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
    </>
  );
}