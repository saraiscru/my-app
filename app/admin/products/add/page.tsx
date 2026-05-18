"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema as schema, type ProductFormData as FormData } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";


type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

type Tag = {
  id: number;
  name: string;
};

function flattenCategories(categories: Category[], parentId: number | null = null, depth = 0): { cat: Category; depth: number }[] {
  const result: { cat: Category; depth: number }[] = [];
  categories.filter((c) => c.parentId === parentId).forEach((c) => {
    result.push({ cat: c, depth });
    result.push(...flattenCategories(categories, c.id, depth + 1));
  });
  return result;
}


export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: () => fetch("/api/tags").then((r) => r.json()),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tagIds: [] },
  });

  const selectedTags = watch("tagIds") || [];
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => setImagePreview(reader.result as string);
  reader.readAsDataURL(file);

  setUploading(true);
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (res.ok) setImageUrl(data.url);
  setUploading(false);
};

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

  const flatCategories = flattenCategories(categories);

  const onSubmit = async (data: FormData) => {
  const description = editor?.getHTML() || "";

  const newProduct = {
    id: Date.now(),
    name: data.name,
    price: data.price,
    description,
    categoryId: data.categoryId,
    category: categories.find((c) => c.id === data.categoryId) || { id: data.categoryId, name: "", parentId: null },
    tags: tags.filter((t) => (data.tagIds || []).includes(t.id)),
    imageUrl: imageUrl ?? null,
  };

  queryClient.setQueryData(["products"], (old: unknown[]) => [newProduct, ...(old || [])]);
  queryClient.setQueryData(["admin-products"], (old: unknown[]) => [newProduct, ...(old || [])]);

  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, description, imageUrl }),
  });

  if (res.ok) {
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    router.push("/admin/products");
  } else {
    // Rollback
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    const errorData = await res.json();
    if (res.status === 401) setSubmitError("Trebuie să fii autentificat pentru a adăuga produse.");
    else if (res.status === 403) setSubmitError("Nu ai permisiunea să adaugi produse.");
    else setSubmitError(errorData.error || "Eroare la salvarea produsului.");
  }
};

  return (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h2 className="text-xl font-bold text-gray-800 mb-6">Produs nou</h2>

    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Nume */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Nume produs</label>
        <input
          {...register("name")}
          placeholder="ex: iPhone 15 Pro"
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      {/* Pret */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Preț (RON)</label>
        <input
          type="number"
          step="0.01"
          {...register("price", { valueAsNumber: true })}
          placeholder="ex: 4999"
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
      </div>

      {/* Descriere */}
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

      {/* Categorie */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Categorie</label>
        <select
          {...register("categoryId", { valueAsNumber: true })}
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
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

      {/* Taguri */}
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

      {/* Imagine */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Imagine produs</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
        />
        {uploading && <p className="text-blue-500 text-xs mt-1">Se încarcă imaginea...</p>}
        {imagePreview && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Preview:</p>
            <div className="relative w-40">
              <img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-xl border border-gray-200" />
              <button
                type="button"
                onClick={() => { setImagePreview(null); setImageUrl(null); }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {submitError}
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-xl hover:bg-gray-50 transition-all"
        >
          Anulează
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Se salvează..." : "Adaugă produs"}
        </button>
      </div>
    </form>
  </div>
);
}