import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TechZone — Adaugă produs",
  description: "Adaugă un produs nou în catalogul TechZone.",
};

export default function AddProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}