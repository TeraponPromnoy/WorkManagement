import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workLogId = Number(id);
  const body = await request.json();
  const { score, comment, scoredBy } = body;

  if (!score || !scoredBy) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (score < 1 || score > 10) {
    return NextResponse.json({ error: "Score must be between 1 and 10" }, { status: 400 });
  }

  const existing = await prisma.score.findUnique({ where: { workLogId } });
  let result;

  if (existing) {
    result = await prisma.score.update({
      where: { workLogId },
      data: { score, comment, scoredBy, scoredAt: new Date() },
    });
  } else {
    result = await prisma.score.create({
      data: { workLogId, score, comment, scoredBy },
    });
  }

  return NextResponse.json(result);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workLog = await prisma.workLog.findUnique({
    where: { id: Number(id) },
    include: { score: true },
  });

  if (!workLog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(workLog);
}
