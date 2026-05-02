"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

const schema = z.object({
  name: z.string().min(1, "Numele este obligatoriu"),
  price: z.coerce.number().min(1, "Prețul trebuie să fie mai mare ca 0"),
  categoryId: z.coerce.number().min(1, "Selectează o categorie"),
  tagIds: z.array(z.number()).optional(),
});

type FormData = z.infer<typeof schema>;

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
  categoryId: number;
  tags: Tag[];
};

function flattenCategories(categories: Category[], parentId: number | null = null, depth = 0): { cat: Category; depth: number }[] {
  const result: { cat: Category; depth: number }[] = [];
  categories.filter((c) => c.parentId === parentId).forEach((c) => {
    result.push({ cat: c, depth });
    result.push(...flattenCategories(categories, c.id, depth + 1));
  });
  return result;
}

export default function EditProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params.id as string;

  const { data: product, isLoading: loadingProduct } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => fetch(`/api/products/${id}`).then((r) => r.json()),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: () => fetch("/api/tags").then((r) => r.json()),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tagIds: [] },
  });

  const selectedTags = watch("tagIds") || [];

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "min-h-[150px] p-3 focus:outline-none prose prose-sm max-w-none",
      },
    },
  });

    useEffect(() => {
         if (product && editor) {
        reset({
      name: product.name,
      price: product.price,
      categoryId: product.categoryId,
      tagIds: (product.tags ?? []).map((t) => t.id),
    });
    setTimeout(() => {
      editor.commands.setContent(product.description || "");
    }, 100);
  }
}, [product, editor, reset]);

  const flatCategories = flattenCategories(categories);

  const onSubmit = async (data: FormData) => {
  const description = editor?.getHTML() || "";
  queryClient.setQueryData(["products"], (old: unknown[]) =>
    (old || []).map((p: any) =>
      p.id === Number(id)
        ? {
            ...p,
            name: data.name,
            price: data.price,
            description,
            categoryId: data.categoryId,
            category: categories.find((c) => c.id === data.categoryId) || p.category,
            tags: tags.filter((t) => (data.tagIds || []).includes(t.id)),
          }
        : p
    )
  );

  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, description }),
  });

  if (res.ok) {
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    router.push("/");
  } else {
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  }
};

  const handleDelete = async () => {
    if (!confirm("Ești sigur că vrei să ștergi acest produs?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/");
  };

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold">⚡ TechZone — Editează produs</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Editează produs</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nume produs</label>
              <input
                {...register("name")}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Preț (RON)</label>
              <input
                type="number"
                step="0.01"
                {...register("price")}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Descriere</label>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex gap-1 p-2 border-b border-gray-100 bg-gray-50">
                  <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`px-2 py-1 text-xs rounded font-bold ${editor?.isActive("bold") ? "bg-blue-500 text-white" : "bg-white border border-gray-200"}`}>B</button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`px-2 py-1 text-xs rounded italic ${editor?.isActive("italic") ? "bg-blue-500 text-white" : "bg-white border border-gray-200"}`}>I</button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={`px-2 py-1 text-xs rounded ${editor?.isActive("bulletList") ? "bg-blue-500 text-white" : "bg-white border border-gray-200"}`}>• Listă</button>
                </div>
                <EditorContent editor={editor} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Categorie</label>
              <select
                {...register("categoryId")}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Selectează categoria</option>
                {flatCategories.map(({ cat, depth }) => (
                  <option key={cat.id} value={cat.id}>
                    {"—".repeat(depth)} {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Taguri</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      const current = selectedTags.includes(tag.id)
                        ? selectedTags.filter((id) => id !== tag.id)
                        : [...selectedTags, tag.id];
                      setValue("tagIds", current);
                    }}
                    className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${
                      selectedTags.includes(tag.id)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-all"
              >
                Șterge produs
              </button>
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
                {isSubmitting ? "Se salvează..." : "Salvează"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}