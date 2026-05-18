import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function requireAdmin(): Promise<NextResponse | null> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  const role = sessionClaims?.role as string;
  if (role !== "admin") {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  return null; 
}