import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const shows = await prisma.tvShow.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { workLogs: true } } },
  });
  return NextResponse.json(shows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "กรุณาระบุชื่อรายการทีวี" }, { status: 400 });
  }

  try {
    const show = await prisma.tvShow.create({ data: { name: name.trim() } });
    return NextResponse.json(show, { status: 201 });
  } catch {
    return NextResponse.json({ error: "ชื่อรายการนี้มีอยู่แล้ว" }, { status: 409 });
  }
}
