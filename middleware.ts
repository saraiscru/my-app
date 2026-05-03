import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

const protectedRoutes = [
  { path: "/api/products", methods: ["POST", "PUT", "DELETE"] },
  { path: "/api/categories", methods: ["POST", "PUT", "DELETE"] },
  { path: "/api/tags", methods: ["POST", "PUT", "DELETE"] },
];

export function middleware(req: NextRequest) {
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
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (method !== "GET" && decoded.role !== "admin") {
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