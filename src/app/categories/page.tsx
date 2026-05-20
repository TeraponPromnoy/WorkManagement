"use client";

import { useState, useEffect, useCallback } from "react";

interface Category {
  id: number;
  name: string;
  createdAt: string;
  _count: { workLogs: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setAdding(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "เกิดข้อผิดพลาด");
      return;
    }
    setNewName("");
    setSuccess("เพิ่มประเภทสำเร็จ");
    fetchCategories();
  };

  const handleDelete = async (cat: Category) => {
    if (cat._count.workLogs > 0) {
      setError(`ไม่สามารถลบ "${cat.name}" ได้ เพราะมีงาน ${cat._count.workLogs} รายการที่ใช้อยู่`);
      return;
    }
    if (!confirm(`ลบประเภท "${cat.name}" ?`)) return;
    setError(""); setSuccess("");
    const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "เกิดข้อผิดพลาด");
      return;
    }
    setSuccess("ลบสำเร็จ");
    fetchCategories();
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setError(""); setSuccess("");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || editId === null) return;
    setError(""); setSuccess("");
    const res = await fetch(`/api/categories/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "เกิดข้อผิดพลาด");
      return;
    }
    setEditId(null);
    setEditName("");
    setSuccess("แก้ไขสำเร็จ");
    fetchCategories();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">จัดการประเภทงาน</h1>
        <p className="text-gray-500 text-sm">เพิ่ม แก้ไข หรือลบประเภทงานสำหรับ dropdown ในหน้าบันทึกงาน</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-700 mb-3">เพิ่มประเภทใหม่</h2>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            placeholder="ชื่อประเภทงาน เช่น พัฒนา, ทดสอบ, เอกสาร"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {adding ? "กำลังเพิ่ม..." : "+ เพิ่ม"}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2 font-medium">{success}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-700">รายการประเภทงาน ({categories.length})</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">กำลังโหลด...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">ยังไม่มีประเภทงาน กรุณาเพิ่มด้านบน</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <li key={cat.id} className="px-5 py-3 flex items-center gap-3">
                {editId === cat.id ? (
                  <form onSubmit={handleEdit} className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      className="flex-1 border border-blue-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      บันทึก
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1.5 rounded-lg transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800 text-sm">{cat.name}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        {cat._count.workLogs > 0
                          ? `ใช้งาน ${cat._count.workLogs} รายการ`
                          : "ยังไม่มีงาน"}
                      </span>
                    </div>
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-blue-500 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={cat._count.workLogs > 0}
                      className="text-red-400 hover:text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={cat._count.workLogs > 0 ? "ไม่สามารถลบได้ เพราะมีงานที่ใช้อยู่" : "ลบประเภทนี้"}
                    >
                      ลบ
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
