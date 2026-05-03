import { Suspense, lazy } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";


const ProductList = lazy(() => import("./components/ProductList"));

const JWT_SECRET = process.env.JWT_SECRET!;

async function getUserFromCookie() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
    return decoded;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await getUserFromCookie();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">⚡ TechZone</h1>
            <p className="text-blue-100 text-sm mt-1">Cele mai bune electronice la prețuri imbatabile</p>
          </div>
          <div className="flex gap-3 items-center">
            {user ? (
              <>
                <span className="text-blue-100 text-sm">👤 {user.email}</span>
                {user.role === "admin" && (
                  <>
                    <Link href="/products/add-product" className="bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-all">
                      + Adaugă produs
                    </Link>
                    <Link href="/categories/add-category" className="bg-white/20 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-all">
                      + Adaugă categorie
                    </Link>
                  </>
                )}
                <LogoutButton />
              </>
            ) : (
              <Link href="/login" className="bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-all">
                Conectează-te
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Toate produsele</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded mt-2"></div>
        </div>
        <Suspense fallback={null}>
          <ProductList isAdmin={user?.role === "admin"} />
        </Suspense>
      </main>
    </div>
  );
}

function LogoutButton() {
  return (
    <form action={async () => {
      "use server";
      const { cookies } = await import("next/headers");
      (await cookies()).set("token", "", { maxAge: 0, path: "/" });
    }}>
      <button type="submit" className="bg-white/20 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-all">
        Deconectează-te
      </button>
    </form>
  );
}