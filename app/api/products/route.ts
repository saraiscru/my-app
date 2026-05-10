import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


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
        where.name = { contains: search };
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