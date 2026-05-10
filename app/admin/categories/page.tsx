"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  const handleDelete = async (id: number) => {
  if (!confirm("Ești sigur că vrei să ștergi această categorie?")) return;
  setDeletingId(id);

  const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });

  if (res.status === 409) {
    const data = await res.json();
    const choice = confirm(
      `Această categorie are ${data.childrenCount} subcategorie(i).\n\nApasă OK pentru a șterge și subcategoriile.\nApasă Anulează pentru a le detașa (devin categorii principale).`
    );
    const mode = choice ? "cascade" : "detach";
    const res2 = await fetch(`/api/categories/${id}?mode=${mode}`, { method: "DELETE" });
    if (!res2.ok) {
      const err = await res2.json();
      alert(err.error || "Eroare la ștergere");
    } else {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    }
  } else if (res.ok) {
    await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
  } else {
    const data = await res.json();
    alert(data.error || "Eroare la ștergere");
  }

  setDeletingId(null);
};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorii</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categorii total</p>
        </div>
        <button
          onClick={() => router.push("/admin/categories/add")}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          + Categorie nouă
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nume</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Părinte</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{cat.name}</td>
                <td className="px-6 py-4">
                  {cat.parentId ? (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium">
                      {categories.find((c) => c.id === cat.parentId)?.name ?? "—"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Root</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => router.push(`/admin/categories/edit/${cat.id}`)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all"
                    >
                      ✏️ Editează
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      {deletingId === cat.id ? "..." : "🗑️ Șterge"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}