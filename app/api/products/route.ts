import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const products = await prisma.product.findMany({
      where: {
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(search && { name: { contains: search } }),
      },
      include: {
        category: true,
        tags: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { error: "Eroare la obtinerea produselor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, description, categoryId, tagIds, imageUrl} = body;

    const product = await prisma.product.create({
      data: {
        name,
        price,
        description,
        categoryId,
        imageUrl: imageUrl ?? null,
        tags: {
          connect: tagIds?.map((id: number) => ({ id })) || [],
        },
      },
      include: {
        category: true,
        tags: true,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Eroare la crearea produsului" },
      { status: 500 }
    );
  }
}