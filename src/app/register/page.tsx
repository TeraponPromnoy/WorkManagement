"use client";

import { useState, useEffect } from "react";
import { useSession } from "../providers";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { user: sessionUser, loading: sessionLoading } = useSession();
  const router = useRouter();
  const isAdmin = sessionUser?.role === "admin";

  const [form, setForm] = useState({ name: "", username: "", password: "", confirmPassword: "", role: "user" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!sessionLoading && !sessionUser) { router.push("/login"); }
    if (!sessionLoading && sessionUser && !isAdmin) { router.push("/"); }
  }, [sessionLoading, sessionUser, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (form.password.length < 4) {
      setError("รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, username: form.username, password: form.password, role: form.role }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "เกิดข้อผิดพลาด");
      return;
    }

    setSuccess(`สมัคร user "${form.name}" สำเร็จ!`);
    setForm({ name: "", username: "", password: "", confirmPassword: "", role: "user" });
  };

  if (sessionLoading) {
    return <div className="flex items-center justify-center min-h-[50vh] text-gray-400">กำลังโหลด...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">สมัคร User ใหม่</h1>
        <p className="text-gray-500 text-sm mt-1">สร้างบัญชีผู้ใช้ใหม่ในระบบ (เฉพาะ Admin)</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-สกุล</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="เช่น สมชาย ใจดี"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username (ชื่อผู้ใช้)</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              placeholder="เช่น somchai"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="อย่างน้อย 4 ตัวอักษร"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท (Role)</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="user">User (ผู้ใช้ทั่วไป)</option>
              <option value="supervisor">หัวหน้างาน</option>
              <option value="admin">Admin (ผู้ดูแลระบบ)</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm font-medium">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {submitting ? "กำลังสมัคร..." : "สมัคร User"}
          </button>
        </form>
      </div>
    </div>
  );
}
