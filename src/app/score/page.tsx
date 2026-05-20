"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "../providers";

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
  icon?: string | null;
}

interface WorkLog {
  id: number;
  date: string;
  taskName: string;
  doneBy: string;
  details: string;
  score: ScoreData | null;
  tvShow: TvShow | null;
  category: Category | null;
}

const MONTHS = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function ScoreStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-8 h-8 rounded-full text-sm font-bold transition-colors border ${
            n <= value
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-400 border-gray-200 hover:border-blue-400"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export default function ScorePage() {
  const { user } = useSession();
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unscored" | "scored">("unscored");
  const [scoring, setScoring] = useState<Record<number, { score: number; comment: string; scoredBy: string }>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/worklogs?all=true");
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const initScore = (log: WorkLog) => {
    if (!scoring[log.id]) {
      setScoring((prev) => ({
        ...prev,
        [log.id]: {
          score: log.score?.score ?? 5,
          comment: log.score?.comment ?? "",
          scoredBy: log.score?.scoredBy ?? user?.name ?? "",
        },
      }));
    }
  };

  const handleSave = async (log: WorkLog) => {
    const s = scoring[log.id];
    if (!s) return;
    setSaving((prev) => ({ ...prev, [log.id]: true }));
    await fetch(`/api/worklogs/${log.id}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    setSaving((prev) => ({ ...prev, [log.id]: false }));
    setSaved((prev) => ({ ...prev, [log.id]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [log.id]: false })), 2000);
    fetchLogs();
  };

  const filtered = logs.filter((log) => {
    if (filter === "unscored") return !log.score;
    if (filter === "scored") return !!log.score;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">ให้คะแนนงาน</h1>
        <p className="text-gray-500 text-sm">หัวหน้างานให้คะแนนรายการงานของพนักงาน (คะแนน 1-10)</p>
      </div>

      <div className="flex gap-2">
        {(["unscored", "all", "scored"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f === "unscored" ? "รอให้คะแนน" : f === "scored" ? "ให้คะแนนแล้ว" : "ทั้งหมด"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">กำลังโหลด...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          ไม่มีรายการ
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((log) => {
            const s = scoring[log.id] ?? { score: log.score?.score ?? 5, comment: log.score?.comment ?? "", scoredBy: log.score?.scoredBy ?? "" };
            return (
              <div
                key={log.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                onClick={() => initScore(log)}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {formatDate(log.date)}
                      </span>
                      <span className="text-xs text-gray-400">โดย {log.doneBy}</span>
                      {log.score && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                          ให้คะแนนแล้ว: {log.score.score}/10
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      {log.tvShow && (
                        <span className="text-2xl">{log.tvShow.icon || "📺"}</span>
                      )}
                      <h3 className="font-semibold text-gray-800">{log.taskName}</h3>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {log.tvShow && (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                          {log.tvShow.name}
                        </span>
                      )}
                      {log.category && (
                        <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                          {log.category.name}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{log.details}</p>
                  </div>
                </div>

                <div className="border-t border-gray-50 pt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">คะแนน</label>
                    <ScoreStars value={s.score} onChange={(v) => setScoring((prev) => ({ ...prev, [log.id]: { ...s, score: v } }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">ความเห็น</label>
                    <input
                      type="text"
                      placeholder="ความเห็น (ถ้ามี)"
                      value={s.comment}
                      onChange={(e) => setScoring((prev) => ({ ...prev, [log.id]: { ...s, comment: e.target.value } }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => handleSave(log)}
                    disabled={saving[log.id]}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-60"
                  >
                    {saving[log.id] ? "กำลังบันทึก..." : saved[log.id] ? "✅ บันทึกแล้ว" : "บันทึกคะแนน"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
