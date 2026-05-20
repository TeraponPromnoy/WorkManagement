"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "../providers";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const { user: sessionUser, loading: sessionLoading } = useSession();
  const router = useRouter();
  const isAdmin = sessionUser?.role === "admin";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "user" });
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!sessionLoading && !sessionUser) { router.push("/login"); return; }
    if (!sessionLoading && sessionUser && !isAdmin) { router.push("/"); }
  }, [sessionLoading, sessionUser, isAdmin, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setAdding(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setAdding(false);
    if (!res.ok) { const d = await res.json(); setError(d.error || "เกิดข้อผิดพลาด"); return; }
    setForm({ name: "", username: "", password: "", role: "user" });
    setSuccess("เพิ่ม User สำเร็จ");
    fetchUsers();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    setError(""); setSuccess("");
    const res = await fetch(`/api/users/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error || "เกิดข้อผิดพลาด"); return; }
    setEditId(null);
    setSuccess("แก้ไขสำเร็จ");
    fetchUsers();
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`ลบ user "${u.name}" (${u.username}) ?`)) return;
    setError(""); setSuccess("");
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); setError(d.error || "เกิดข้อผิดพลาด"); return; }
    setSuccess("ลบสำเร็จ");
    fetchUsers();
  };

  if (!sessionLoading && sessionUser && !isAdmin) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">จัดการ User</h1>
        <p className="text-gray-500 text-sm">เพิ่ม แก้ไข หรือลบผู้ใช้งานในระบบ (Admin only)</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-700 mb-3">เพิ่ม User ใหม่</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="ชื่อ-สกุล"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="user">User</option>
            <option value="supervisor">หัวหน้างาน</option>
            <option value="admin">Admin</option>
          </select>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={adding}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {adding ? "กำลังเพิ่ม..." : "+ เพิ่ม User"}
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2 font-medium">{success}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-700">รายชื่อ User ({users.length})</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">กำลังโหลด...</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {users.map((u) => (
              <li key={u.id} className="px-5 py-3">
                {editId === u.id ? (
                  <form onSubmit={handleEdit} className="flex flex-wrap gap-2 items-center">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="ชื่อ"
                      className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-32"
                    />
                    <input
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      placeholder="รหัสผ่านใหม่ (ว่าง=ไม่เปลี่ยน)"
                      className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-40"
                    />
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="user">User</option>
                      <option value="supervisor">หัวหน้างาน</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded-lg">บันทึก</button>
                    <button type="button" onClick={() => setEditId(null)} className="text-gray-400 text-sm px-2 py-1.5 rounded-lg">ยกเลิก</button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-800 text-sm">{u.name}</span>
                      <span className="ml-2 text-xs text-gray-400">@{u.username}</span>
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${u.role === "admin" ? "bg-orange-100 text-orange-700" : u.role === "supervisor" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`}>
                        {u.role === "supervisor" ? "หัวหน้างาน" : u.role}
                      </span>
                    </div>
                    <button
                      onClick={() => { setEditId(u.id); setEditForm({ name: u.name, password: "", role: u.role }); setError(""); setSuccess(""); }}
                      className="text-blue-500 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      className="text-red-400 hover:text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      ลบ
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
