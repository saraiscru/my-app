import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TechZone — Adaugă categorie",
  description: "Adaugă o categorie nouă în catalogul TechZone.",
};

export default function AddCategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}