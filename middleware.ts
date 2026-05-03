import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const protectedRoutes = [
  { path: "/api/products", methods: ["POST", "PUT", "DELETE"] },
  { path: "/api/categories", methods: ["POST", "PUT", "DELETE"] },
  { path: "/api/tags", methods: ["POST", "PUT", "DELETE"] },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  const isProtected = protectedRoutes.some(
    (route) => pathname.startsWith(route.path) && route.methods.includes(method)
  );

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    if (method !== "GET" && role !== "admin") {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: "Token invalid" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/products/:path*", "/api/categories/:path*", "/api/tags/:path*"],
};