import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { tagSchema } from "@/lib/validations";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany();
    return NextResponse.json(tags);
  } catch (error) {
    return NextResponse.json(
      { error: "Eroare la obtinerea tagurilor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    
    const parsed = tagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: { name: parsed.data.name },
    });
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Eroare la crearea tagului" },
      { status: 500 }
    );
  }
}