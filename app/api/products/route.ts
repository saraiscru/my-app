import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const tagIds = searchParams.getAll("tagId").map(Number).filter(Boolean);
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "9"));
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

    const allowedSortFields = ["createdAt", "name", "price"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const where: Record<string, unknown> = {};

    const categoryIds = searchParams.getAll("categoryId").map(Number).filter(Boolean);
    if (categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { name: { contains: search } } },
      ];
    }

    if (tagIds.length > 0) {
      where.AND = tagIds.map((id) => ({
        tags: { some: { id } },
      }));
    }

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true, tags: true },
      orderBy: { [safeSortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.product.count({ where });

    const priceAggregate = await prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true },
    });

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      minPrice: priceAggregate._min.price ?? 0,
      maxPrice: priceAggregate._max.price ?? 0,
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { error: "Eroare la obtinerea produselor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        price: parsed.data.price,
        description: parsed.data.description,
        categoryId: parsed.data.categoryId,
        imageUrl: parsed.data.imageUrl ?? null,
        tags: {
          connect: parsed.data.tagIds?.map((id) => ({ id })) || [],
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