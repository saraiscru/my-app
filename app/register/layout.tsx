import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TechZone — Înregistrează-te",
  description: "Creează un cont nou pe TechZone.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}