import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const tvShowId = searchParams.get("tvShowId");

  if (!month || !year) {
    return NextResponse.json({ error: "month and year are required" }, { status: 400 });
  }

  const startDate = new Date(Number(year), Number(month) - 1, 1);
  const endDate = new Date(Number(year), Number(month), 1);

  const where: Record<string, unknown> = {
    date: { gte: startDate, lt: endDate },
  };
  if (tvShowId) {
    where.tvShowId = Number(tvShowId);
  }

  const logs = await prisma.workLog.findMany({
    where,
    include: { score: true, category: true, tvShow: true },
    orderBy: { date: "asc" },
  });

  const total = logs.length;
  const scored = logs.filter((l) => l.score !== null);
  const totalScore =
    scored.length > 0
      ? scored.reduce((sum, l) => sum + (l.score?.score ?? 0), 0)
      : 0;

  const byPerson: Record<string, { count: number; totalScore: number; scoredCount: number }> = {};
  for (const log of logs) {
    if (!byPerson[log.doneBy]) {
      byPerson[log.doneBy] = { count: 0, totalScore: 0, scoredCount: 0 };
    }
    byPerson[log.doneBy].count++;
    if (log.score) {
      byPerson[log.doneBy].totalScore += log.score.score;
      byPerson[log.doneBy].scoredCount++;
    }
  }

  return NextResponse.json({
    month: Number(month),
    year: Number(year),
    total,
    scoredCount: scored.length,
    totalScore,
    byPerson,
    logs,
  });
}
