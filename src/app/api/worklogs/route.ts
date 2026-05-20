import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const all = searchParams.get("all") === "true";
  const tvShowId = searchParams.get("tvShowId");

  const session = await getSession();

  let where: Record<string, unknown> = {};
  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 1);
    where.date = { gte: startDate, lt: endDate };
  }
  if (tvShowId) {
    where.tvShowId = Number(tvShowId);
  }
  if (!all && session) {
    where.userId = session.id;
  }

  const logs = await prisma.workLog.findMany({
    where,
    include: { score: true, category: true, tvShow: true, user: { select: { id: true, name: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(logs);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, tvShowId, userId, details, categoryId } = body;

    if (!date || !userId || !details) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userRecord = await prisma.user.findUnique({ where: { id: Number(userId) }, select: { name: true } });
    const doneBy = userRecord?.name ?? "";

    if (tvShowId) {
      const tv = await prisma.tvShow.findUnique({ where: { id: Number(tvShowId) } });
      if (!tv) return NextResponse.json({ error: "ไม่พบรายการทีวีที่เลือก" }, { status: 400 });
    }
    if (categoryId) {
      const cat = await prisma.taskCategory.findUnique({ where: { id: Number(categoryId) } });
      if (!cat) return NextResponse.json({ error: "ไม่พบประเภทงานที่เลือก" }, { status: 400 });
    }

    const dateTime = time ? `${date}T${time}` : date;
    const created = await prisma.workLog.create({
      data: {
        date: new Date(dateTime),
        doneBy,
        details,
        ...(tvShowId ? { tvShowId: Number(tvShowId) } : {}),
        ...(userId ? { userId: Number(userId) } : {}),
        ...(categoryId ? { categoryId: Number(categoryId) } : {}),
      },
    });

    const log = await prisma.workLog.findUnique({
      where: { id: created.id },
      include: { score: true, category: true, tvShow: true, user: { select: { id: true, name: true } } },
    });

    return NextResponse.json(log ?? created, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("POST /api/worklogs error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
