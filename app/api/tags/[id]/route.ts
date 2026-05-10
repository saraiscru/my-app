
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tag = await prisma.tag.findUnique({
    where: { id: Number(id) },
    include: { products: true },
  });
  if (!tag)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tag);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.tag.findFirst({
    where: { name: body.name, NOT: { id: Number(id) } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Exista deja un tag cu acest nume" },
      { status: 400 }
    );
  }

  const tag = await prisma.tag.update({
    where: { id: Number(id) },
    data: { name: body.name },
  });
  return NextResponse.json(tag);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const tag = await prisma.tag.findUnique({
    where: { id: Number(id) },
    include: { products: true },
  });

  if (!tag)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.tag.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}