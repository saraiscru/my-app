"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(1, "Numele este obligatoriu"),
  parentId: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

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

export default function AddCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const flatCategories = flattenCategories(categories);

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        parentId: data.parentId || null,
      }),
    });
    if (res.ok) {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold">⚡ TechZone — Adaugă categorie</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Categorie nouă</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nume categorie</label>
              <input
                {...register("name")}
                placeholder="Ex: Smartphone-uri"
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Categorie părinte <span className="text-gray-400 font-normal">(opțional)</span>
              </label>
              <select
                {...register("parentId")}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Fără părinte (categorie principală)</option>
                {flatCategories.map(({ cat, depth }) => (
                  <option key={cat.id} value={cat.id}>
                    {"—".repeat(depth)} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-xl hover:bg-gray-50 transition-all"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Se salvează..." : "Salvează categoria"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}