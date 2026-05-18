"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tagSchema as schema, type TagFormData as FormData } from "@/lib/validations";
import { useState } from "react";

type Tag = {
  id: number;
  name: string;
};

export default function AdminTagsPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: tags = [], isLoading } = useQuery<Tag[]>({
    queryKey: ["admin-tags"],
    queryFn: () => fetch("/api/tags").then((r) => r.json()),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openAdd = () => {
    setEditingTag(null);
    reset({ name: "" });
    setSubmitError(null);
    setShowForm(true);
  };

  const openEdit = (tag: Tag) => {
    setEditingTag(tag);
    reset({ name: tag.name });
    setSubmitError(null);
    setShowForm(true);
  };

const onSubmit = async (data: FormData) => {
  setSubmitError(null);

  // Optimistic UI
  if (editingTag) {
    // Edit
    queryClient.setQueryData(["tags"], (old: Tag[] = []) =>
      old.map((t) => t.id === editingTag.id ? { ...t, name: data.name } : t)
    );
    queryClient.setQueryData(["admin-tags"], (old: Tag[] = []) =>
      old.map((t) => t.id === editingTag.id ? { ...t, name: data.name } : t)
    );
  } else {
    // Add
    const tempTag = { id: Date.now(), name: data.name };
    queryClient.setQueryData(["tags"], (old: Tag[] = []) => [...old, tempTag]);
    queryClient.setQueryData(["admin-tags"], (old: Tag[] = []) => [...old, tempTag]);
  }

  const res = editingTag
    ? await fetch(`/api/tags/${editingTag.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      })
    : await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });

  if (res.ok) {
    await queryClient.invalidateQueries({ queryKey: ["tags"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
    await queryClient.invalidateQueries({ queryKey: ["all-tags"] });
    setShowForm(false);
    reset({ name: "" });
  } else {
    // Rollback
    await queryClient.invalidateQueries({ queryKey: ["tags"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
    await queryClient.invalidateQueries({ queryKey: ["all-tags"] });
    const errorData = await res.json();
    setSubmitError(errorData.error || "Eroare la salvare.");
  }
};

  const handleDelete = async (id: number) => {
    if (!confirm("Ești sigur că vrei să ștergi acest tag?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
    if (res.ok) {
      await queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
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
          <h1 className="text-2xl font-bold text-gray-800">Taguri</h1>
          <p className="text-sm text-gray-500 mt-1">{tags.length} taguri total</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          + Tag nou
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">
            {editingTag ? "Editează tag" : "Tag nou"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nume tag</label>
              <input
                {...register("name")}
                placeholder="ex: Nou, Reducere, Premium..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {submitError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-xl hover:bg-gray-50 transition-all"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Se salvează..." : "Salvează"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nume</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                <td className="px-6 py-4">
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                    {tag.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => openEdit(tag)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all"
                    >
                      ✏️ Editează
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      disabled={deletingId === tag.id}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      {deletingId === tag.id ? "..." : "🗑️ Șterge"}
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