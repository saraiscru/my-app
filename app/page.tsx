import { Suspense, lazy } from "react";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

const ProductList = lazy(() => import("./components/ProductList"));

export const dynamic = "force-dynamic";

export default async function Home() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const user = userId ? await currentUser() : null;



  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-5 flex items-center justify-between ">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">⚡ TechZone</h1>
            <p className="text-blue-100 text-sm mt-1">Cele mai bune electronice la prețuri imbatabile</p>
          </div>
          <div className="flex gap-3 items-center">
            {userId ? (
              <>
                <span className="hidden sm:inline text-blue-100 text-sm">👤 {user?.emailAddresses[0]?.emailAddress}</span>
                {role === "admin" && (
                  <Link href="/admin" className="bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-all">
                    Admin
                  </Link>
                )}
                <div className="bg-white/20 px-2 py-2 rounded-xl hover:bg-white/30 transition-all cursor-pointer relative">
                <UserButton />
                <span className="absolute bottom-1 right-1 text-white text-[8px] leading-none">▾</span>
              </div>
              </>
            ) : (
              <Link href="/login" className="bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-all">
                Conectează-te
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 md:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Toate produsele</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded mt-2"></div>
        </div>
        <Suspense fallback={null}>
          <ProductList isAdmin={role === "admin"} />
        </Suspense>
      </main>
    </div>
  );
}