import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
 "/",
  "/products/(.*)",
  "/login(.*)",
  "/register(.*)",
  "/api/products(.*)",
  "/api/categories(.*)",
  "/api/tags(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  const isApi = request.nextUrl.pathname.startsWith("/api/");
  const isMutation = request.method !== "GET";

  if (isApi && isMutation) {
    if (!userId) {
      return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
    }

    const role = sessionClaims?.role as string;
    if (role !== "admin") {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }
  }

  if (!isPublicRoute(request) && !userId) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};