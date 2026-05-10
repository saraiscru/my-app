import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/products/(.*)",
  "/login(.*)",
  "/register(.*)",
  // API-uri publice doar GET
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  console.log("middleware path:", request.nextUrl.pathname, "userId:", userId);
  
  // Protejează toate rutele non-publice
  if (!isPublicRoute(request)) {
    if (!userId) {
      const signInUrl = new URL("/login", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Protejează API-urile pentru metode non-GET
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
  if (isApiRoute && request.method !== "GET") {
    if (!userId) {
      return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

