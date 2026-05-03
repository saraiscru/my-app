import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TechZone — Conectează-te",
  description: "Conectează-te la contul tău TechZone.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}