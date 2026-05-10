import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TechZone — Taguri",
  description: "Administrează tagurile din catalogul TechZone.",
};

export default function TagsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}