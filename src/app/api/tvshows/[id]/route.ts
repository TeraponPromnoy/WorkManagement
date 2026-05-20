import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "กรุณาระบุชื่อรายการ" }, { status: 400 });
  }

  try {
    const show = await prisma.tvShow.update({
      where: { id: Number(id) },
      data: { name: name.trim() },
    });
    return NextResponse.json(show);
  } catch {
    return NextResponse.json({ error: "ชื่อรายการนี้มีอยู่แล้ว" }, { status: 409 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tvShowId = Number(id);

  const inUse = await prisma.workLog.count({ where: { tvShowId } });
  if (inUse > 0) {
    return NextResponse.json(
      { error: `ไม่สามารถลบได้ มีงาน ${inUse} รายการที่ใช้รายการนี้อยู่` },
      { status: 409 }
    );
  }

  await prisma.tvShow.delete({ where: { id: tvShowId } });
  return NextResponse.json({ ok: true });
}
