import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, username: true, role: true, createdAt: true },
  });
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, username, password, role } = body;

  if (!name?.trim() || !username?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  const trimmedUsername = username.trim();
  const existing = await prisma.user.findUnique({ where: { username: trimmedUsername } });
  if (existing) {
    return NextResponse.json({ error: "Username นี้มีอยู่แล้ว" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { name: name.trim(), username: trimmedUsername, passwordHash, role: role || "user" },
      select: { id: true, name: true, username: true, role: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("POST /api/users error:", msg);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด: " + msg }, { status: 500 });
  }
}
