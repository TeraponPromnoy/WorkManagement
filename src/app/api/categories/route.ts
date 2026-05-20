import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.taskCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { workLogs: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "กรุณาระบุชื่อประเภท" }, { status: 400 });
  }

  try {
    const category = await prisma.taskCategory.create({
      data: { name: name.trim() },
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: "ชื่อประเภทนี้มีอยู่แล้ว" }, { status: 409 });
  }
}
