import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TechZone — Editează produs",
  description: "Editează detaliile produsului în catalogul TechZone.",
};

export default function EditProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}