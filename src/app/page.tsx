"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "./providers";

interface ScoreData {
  score: number;
  comment: string | null;
  scoredBy: string;
  scoredAt: string;
}

interface Category {
  id: number;
  name: string;
}

interface TvShow {
  id: number;
  name: string;
}

interface WorkLog {
  id: number;
  date: string;
  tvShow: TvShow | null;
  taskName: string;
  doneBy: string;
  details: string;
  createdAt: string;
  category: Category | null;
  score: ScoreData | null;
  userId?: number;
}

const MONTHS = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
];

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear() + 543} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function Home() {
  const { user: sessionUser } = useSession();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ date: today, tvShowId: "", userId: "", details: "", categoryId: "" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [tvShows, setTvShows] = useState<TvShow[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: number; name: string }[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ date: "", tvShowId: "", userId: "", details: "", categoryId: "" });
  const [editing, setEditing] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/worklogs");
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }, []);

  const fetchTvShows = useCallback(async () => {
    const res = await fetch("/api/tvshows");
    const data = await res.json();
    setTvShows(data);
  }, []);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setAllUsers(data);
  }, []);

  useEffect(() => { fetchLogs(); fetchCategories(); fetchTvShows(); fetchUsers(); }, [fetchLogs, fetchCategories, fetchTvShows, fetchUsers]);

  useEffect(() => {
    if (sessionUser?.id && !form.userId) {
      setForm((f) => ({ ...f, userId: String(sessionUser.id) }));
    }
  }, [sessionUser, form.userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    const res = await fetch("/api/worklogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "เกิดข้อผิดพลาด");
      return;
    }
    setSuccess("บันทึกงานสำเร็จ!");
    setForm({ date: today, tvShowId: "", userId: sessionUser?.id ? String(sessionUser.id) : "", details: "", categoryId: "" });
    fetchLogs();
  };

  const handleEdit = async (log: WorkLog) => {
    setEditId(log.id);
    setEditForm({
      date: log.date.split("T")[0],
      tvShowId: String(log.tvShow?.id ?? ""),
      userId: String(log.userId ?? ""),
      details: log.details,
      categoryId: String(log.category?.id ?? ""),
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEditing(true);
    const res = await fetch(`/api/worklogs/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditing(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "แก้ไขไม่สำเร็จ");
      return;
    }
    setEditId(null);
    setEditForm({ date: "", tvShowId: "", userId: "", details: "", categoryId: "" });
    fetchLogs();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">บันทึกงานประจำวัน</h1>
        <p className="text-gray-500 text-sm">กรอกรายละเอียดงานที่ทำในวันนี้</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อรายการทีวี <span className="text-red-500">*</span></label>
              <select
                value={form.tvShowId}
                onChange={(e) => setForm({ ...form, tvShowId: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- เลือกรายการทีวี --</option>
                {tvShows.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {tvShows.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  ยังไม่มีรายการทีวี{" "}
                  <a href="/tvshows" className="text-blue-500 underline">เพิ่มรายการ</a>
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทงาน</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- ไม่ระบุประเภท --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  ยังไม่มีประเภทงาน{" "}
                  <a href="/categories" className="text-blue-500 underline">เพิ่มประเภท</a>
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดงาน <span className="text-red-500">*</span></label>
            <textarea
              placeholder="อธิบายรายละเอียดงานที่ทำ..."
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              required
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm font-medium">{success}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {submitting ? "กำลังบันทึก..." : "💾 บันทึกงาน"}
          </button>
        </form>
      </div>

      {editId && (
        <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">แก้ไขรายการงาน</h3>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อรายการทีวี <span className="text-red-500">*</span></label>
                <select
                  value={editForm.tvShowId}
                  onChange={(e) => setEditForm({ ...editForm, tvShowId: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- เลือกรายการทีวี --</option>
                  {tvShows.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทงาน</label>
                <select
                  value={editForm.categoryId}
                  onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- ไม่ระบุประเภท --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดงาน <span className="text-red-500">*</span></label>
              <textarea
                value={editForm.details}
                onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                required
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={editing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {editing ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </button>
              <button
                type="button"
                onClick={() => { setEditId(null); setEditForm({ date: "", tvShowId: "", userId: "", details: "", categoryId: "" }); setError(""); }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-5 py-2 rounded-lg text-sm transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">รายการงานล่าสุด</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">กำลังโหลด...</p>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
            ยังไม่มีรายการงาน กรุณาบันทึกงานแรก
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {formatDateTime(log.date)}
                      </span>
                      <span className="text-xs text-gray-400">โดย {log.doneBy}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        สร้าง: {formatDateTime(log.createdAt)}
                      </span>
                      {log.category && (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                          {log.category.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {log.tvShow ? (
                        <span className="flex items-center gap-1">📺 {log.tvShow.name}</span>
                      ) : (
                        <span className="text-gray-400 italic">ไม่ระบุรายการ</span>
                      )}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{log.details}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex flex-col items-center gap-2">
                      {log.score ? (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                          ได้คะแนนแล้ว
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-full">รอคะแนน</span>
                      )}
                      {!log.score && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(log)}
                            className="text-blue-400 hover:text-blue-600 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm("ลบรายการนี้?")) return;
                              setDeleteId(log.id);
                              const res = await fetch(`/api/worklogs/${log.id}`, { method: "DELETE" });
                              setDeleteId(null);
                              if (!res.ok) { const d = await res.json(); alert(d.error || "ลบไม่สำเร็จ"); return; }
                              fetchLogs();
                            }}
                            disabled={deleteId === log.id}
                            className="text-red-400 hover:text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deleteId === log.id ? "กำลังลบ..." : "ลบ"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
