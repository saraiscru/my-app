import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  try {
    const body = await request.json();
    const { name } = body;

    const tag = await prisma.tag.create({
      data: { name },
    });
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Eroare la crearea tagului" },
      { status: 500 }
    );
  }
}