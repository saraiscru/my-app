import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
    include: { parent: true, children: true, products: true },
  });
  if (!category)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(category);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json();

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (parsed.data.parentId && Number(parsed.data.parentId) === Number(id)) {
    return NextResponse.json(
      { error: "O categorie nu poate fi propriul parinte" },
      { status: 400 }
    );
  }

  const category = await prisma.category.update({
    where: { id: Number(id) },
    data: {
      name: parsed.data.name,
      parentId: parsed.data.parentId ?? null,
    },
    include: { parent: true, children: true },
  });
  return NextResponse.json(category);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
    include: { children: true, products: true },
  });

  if (!category)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (category.products.length > 0) {
    return NextResponse.json(
      { error: "Categoria are produse asociate. Mută-le mai întâi." },
      { status: 400 }
    );
  }

  const hasChildren = category.children.length > 0;

  if (hasChildren && !mode) {
    return NextResponse.json(
      {
        error: "confirm_required",
        childrenCount: category.children.length,
      },
      { status: 409 }
    );
  }

  if (hasChildren && mode === "cascade") {
    const childrenWithProducts = await prisma.category.findMany({
      where: { parentId: Number(id) },
      include: { products: true },
    });
    const childWithProducts = childrenWithProducts.find(
      (c) => c.products.length > 0
    );
    if (childWithProducts) {
      return NextResponse.json(
        {
          error: `Subcategoria "${childWithProducts.name}" are produse asociate. Mută-le mai întâi.`,
        },
        { status: 400 }
      );
    }
    await prisma.$transaction([
      prisma.category.deleteMany({ where: { parentId: Number(id) } }),
      prisma.category.delete({ where: { id: Number(id) } }),
    ]);
  } else if (hasChildren && mode === "detach") {
    await prisma.$transaction([
      prisma.category.updateMany({
        where: { parentId: Number(id) },
        data: { parentId: null },
      }),
      prisma.category.delete({ where: { id: Number(id) } }),
    ]);
  } else {
    await prisma.category.delete({ where: { id: Number(id) } });
  }

  return NextResponse.json({ success: true });
}