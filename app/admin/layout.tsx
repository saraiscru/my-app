import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();

  if (!userId) redirect("/login");

  const role = sessionClaims?.role as string;
  if (role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Checkbox ascuns care controlează sidebar-ul */}
      <input type="checkbox" id="sidebar-toggle" className="hidden peer/sidebar" />

      {/* Buton hamburger - doar pe mobil */}
      <label
        htmlFor="sidebar-toggle"
        className="md:hidden fixed bottom-20 right-4 z-50 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl rounded-full w-14 h-14 flex items-center justify-center text-xl border-2 border-white cursor-pointer"
      >
        ☰
      </label>

      {/* Overlay - click pe el închide sidebar-ul */}
      <label
        htmlFor="sidebar-toggle"
        className="md:hidden fixed inset-0 bg-black/40 z-30 hidden peer-checked/sidebar:block"
      />

      {/* Sidebar */}
      <aside className="
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex flex-col
        -translate-x-full peer-checked/sidebar:translate-x-0
        transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-auto
      ">
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-blue-600">⚡ TechZone</Link>
          <Link href="/" className="text-sm text-blue-500 hover:underline mt-1 block">← Înapoi la site</Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Panou administrare</p>
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
      </aside>

      {/* Conținut principal */}
      <main className="flex-1 p-4 md:p-8 min-w-0">
        {children}
      </main>

    </div>
  );
}