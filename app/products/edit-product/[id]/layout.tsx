import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import type { Metadata } from "next";



const JWT_SECRET = process.env.JWT_SECRET!;


export const metadata: Metadata = {
  title: "TechZone — Editează produs",
  description: "Editează detaliile produsului în catalogul TechZone.",
};

export default async function AddProductLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== "admin") redirect("/");
  } catch {
    redirect("/login");
  }

  return <>{children}</>;
}