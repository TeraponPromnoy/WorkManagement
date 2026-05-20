"use client";

import Link from "next/link";
import { useSession } from "./providers";

export default function Header() {
  const { user, logout } = useSession();
  const isAdmin = user?.role === "admin";
  const isSupervisor = user?.role === "supervisor";
  const canScore = isAdmin || isSupervisor;

  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
          📋 Work Management
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="hover:text-blue-200 transition-colors">บันทึกงาน</Link>
          {canScore && (
            <Link href="/score" className="hover:text-blue-200 transition-colors">ให้คะแนน</Link>
          )}
          {canScore && (
            <Link href="/report" className="hover:text-blue-200 transition-colors">รายงาน</Link>
          )}
          <Link href="/tvshows" className="hover:text-blue-200 transition-colors">รายการทีวี</Link>
          <Link href="/my-worklogs" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
            ประวัติงาน
          </Link>
          {isAdmin && (
            <>
              <Link href="/register" className="hover:text-blue-200 transition-colors">สมัคร User</Link>
              <Link href="/users" className="hover:text-blue-200 transition-colors">จัดการ User</Link>
            </>
          )}
          {user && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-blue-500">
              <span className="text-blue-200 text-xs">{user.name}</span>
              <button
                onClick={logout}
                className="bg-blue-600 hover:bg-red-500 border border-blue-400 text-white text-xs px-2 py-1 rounded transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
