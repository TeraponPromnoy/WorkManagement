import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoryId = Number(id);

  const inUse = await prisma.workLog.count({ where: { categoryId } });
  if (inUse > 0) {
    return NextResponse.json(
      { error: `ไม่สามารถลบได้ มีงาน ${inUse} รายการที่ใช้ประเภทนี้อยู่` },
      { status: 409 }
    );
  }

  await prisma.taskCategory.delete({ where: { id: categoryId } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "กรุณาระบุชื่อประเภท" }, { status: 400 });
  }

  try {
    const category = await prisma.taskCategory.update({
      where: { id: Number(id) },
      data: { name: name.trim() },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "ชื่อประเภทนี้มีอยู่แล้ว" }, { status: 409 });
  }
}
