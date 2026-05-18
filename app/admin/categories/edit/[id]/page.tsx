"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema as schema, type CategoryFormData as FormData } from "@/lib/validations";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";


type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

function flattenCategories(categories: Category[], parentId: number | null = null, depth = 0): { cat: Category; depth: number }[] {
  const result: { cat: Category; depth: number }[] = [];
  categories.filter((c) => c.parentId === parentId).forEach((c) => {
    result.push({ cat: c, depth });
    result.push(...flattenCategories(categories, c.id, depth + 1));
  });
  return result;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params.id as string;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: category, isLoading: loadingCategory } = useQuery<Category>({
    queryKey: ["category", id],
    queryFn: () => fetch(`/api/categories/${id}`).then((r) => r.json()),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        parentId: category.parentId ?? undefined,
      });
    }
  }, [category, reset]);

  const flatCategories = flattenCategories(categories).filter(({ cat }) => cat.id !== Number(id));

 const onSubmit = async (data: FormData) => {
    setSubmitError(null);

    // Optimistic UI — actualizează categoria imediat în cache
    const updatedCategory = {
      id: Number(id),
      name: data.name,
      parentId: data.parentId || null,
    };

    queryClient.setQueryData(["categories"], (old: Category[] = []) =>
      old.map((c) => c.id === Number(id) ? { ...c, ...updatedCategory } : c)
    );
    queryClient.setQueryData(["admin-categories"], (old: Category[] = []) =>
      old.map((c) => c.id === Number(id) ? { ...c, ...updatedCategory } : c)
    );

    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        parentId: data.parentId || null,
      }),
    });

    if (res.ok) {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      router.push("/admin/categories");
    } else {
      // Rollback
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      const errorData = await res.json();
      setSubmitError(errorData.error || "Eroare la salvarea categoriei.");
    }
  };

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Editează categorie</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Nume categorie</label>
            <input
              {...register("name")}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Categorie părinte <span className="text-gray-400 font-normal">(opțional)</span>
            </label>
            <select
              {...register("parentId")}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Fără părinte (categorie principală)</option>
              {flatCategories.map(({ cat, depth }) => (
                <option key={cat.id} value={cat.id}>
                  {"—".repeat(depth)} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {submitError}
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => router.push("/admin/categories")}
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
    </div>
  );
}