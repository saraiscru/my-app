import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Numele este obligatoriu"),
  price: z.coerce.number({ invalid_type_error: "Prețul trebuie să fie un număr" }).positive("Prețul trebuie să fie mai mare ca 0"),
  description: z.string().optional(),
  categoryId: z.coerce.number({ invalid_type_error: "Selectează o categorie" }).min(1, "Selectează o categorie"),
  tagIds: z.array(z.number()).optional(),
  imageUrl: z.string().url().optional().nullable(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Numele este obligatoriu"),
  parentId: z.coerce.number().optional().nullable(),
});

export const tagSchema = z.object({
  name: z.string().min(1, "Numele este obligatoriu"),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type TagFormData = z.infer<typeof tagSchema>;