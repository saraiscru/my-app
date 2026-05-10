import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
const { userId, sessionClaims } = await auth();

if (!userId) redirect("/login");

const role = (sessionClaims?.metadata as { role?: string })?.role;
console.log("role:", role);
if (role !== "admin") redirect("/");


  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-blue-600">⚡ TechZone</Link>
          <p className="text-xs text-gray-500 mt-1">Panou administrare</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all">
            📦 Produse
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all">
            🗂️ Categorii
          </Link>
          <Link href="/admin/tags" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all">
            🏷️ Taguri
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">
            ← Înapoi la site
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}