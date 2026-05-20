import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const workLogId = Number(id);
  const body = await request.json();
  const { date, tvShowId, userId, details, categoryId } = body;

  const log = await prisma.workLog.findUnique({
    where: { id: workLogId },
    include: { score: true },
  });

  if (!log) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (log.userId !== session.id && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (log.score) {
    return NextResponse.json({ error: "ไม่สามารถแก้ไขงานที่ให้คะแนนแล้วได้" }, { status: 400 });
  }

  const userRecord = await prisma.user.findUnique({ where: { id: Number(userId) }, select: { name: true } });
  const doneBy = userRecord?.name ?? "";

  const updated = await prisma.workLog.update({
    where: { id: workLogId },
    data: {
      date: date ? new Date(date) : undefined,
      doneBy,
      details: details ?? undefined,
      ...(tvShowId ? { tvShowId: Number(tvShowId) } : {}),
      ...(userId ? { userId: Number(userId) } : {}),
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
    },
  });

  const result = await prisma.workLog.findUnique({
    where: { id: workLogId },
    include: { score: true, category: true, tvShow: true, user: { select: { id: true, name: true } } },
  });

  return NextResponse.json(result ?? updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const workLogId = Number(id);

  const log = await prisma.workLog.findUnique({
    where: { id: workLogId },
    include: { score: true },
  });

  if (!log) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (log.userId !== session.id && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (log.score) {
    return NextResponse.json({ error: "ไม่สามารถลบงานที่ให้คะแนนแล้วได้" }, { status: 400 });
  }

  await prisma.workLog.delete({ where: { id: workLogId } });
  return NextResponse.json({ ok: true });
}
