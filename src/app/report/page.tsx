"use client";

import { useState, useEffect, useCallback } from "react";

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
  doneBy: string;
  details: string;
  score: ScoreData | null;
  createdAt: string;
  tvShow: TvShow | null;
  category: Category | null;
}

interface PersonStat {
  count: number;
  totalScore: number;
  scoredCount: number;
}

interface ReportData {
  month: number;
  year: number;
  total: number;
  scoredCount: number;
  totalScore: number;
  byPerson: Record<string, PersonStat>;
  logs: WorkLog[];
}

interface TvShow {
  id: number;
  name: string;
}

const MONTHS = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
];

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear() + 543} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-gray-400">-</span>;
  const color = score >= 8 ? "text-green-600" : score >= 5 ? "text-yellow-600" : "text-red-500";
  return <span className={`font-bold ${color}`}>{score}/10</span>;
}

export default function ReportPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [tvShowId, setTvShowId] = useState<string>("");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tvShows, setTvShows] = useState<TvShow[]>([]);
  const [selectedLog, setSelectedLog] = useState<WorkLog | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const url = `/api/report?month=${month}&year=${year}${tvShowId ? `&tvShowId=${tvShowId}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setReport(data);
    setLoading(false);
  }, [month, year, tvShowId]);

  const fetchTvShows = useCallback(async () => {
    const res = await fetch("/api/tvshows");
    const data = await res.json();
    setTvShows(data);
  }, []);

  useEffect(() => { fetchReport(); fetchTvShows(); }, [fetchReport, fetchTvShows]);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">รายงานประจำเดือน</h1>
        <p className="text-gray-500 text-sm">สรุปงานและคะแนนรายเดือน</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">เดือน</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ปี (พ.ศ.)</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y + 543}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">รายการทีวี</label>
            <select
              value={tvShowId}
              onChange={(e) => setTvShowId(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">ทั้งหมด</option>
              {tvShows.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
          >
            🔍 ดูรายงาน
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">กำลังโหลด...</p>
      ) : report ? (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-700">
            รายงานเดือน {MONTHS[report.month - 1]} {report.year + 543}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{report.total}</p>
              <p className="text-sm text-blue-600 mt-1">รายการทั้งหมด</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{report.scoredCount}</p>
              <p className="text-sm text-green-600 mt-1">ให้คะแนนแล้ว</p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-orange-700">{report.total - report.scoredCount}</p>
              <p className="text-sm text-orange-600 mt-1">รอให้คะแนน</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-purple-700">{report.totalScore}</p>
              <p className="text-sm text-purple-600 mt-1">รวมคะแนน</p>
            </div>
          </div>

          {Object.keys(report.byPerson).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-700">สรุปตามพนักงาน</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <th className="px-5 py-3 text-left">ชื่อ</th>
                    <th className="px-5 py-3 text-center">จำนวนงาน</th>
                    <th className="px-5 py-3 text-center">ให้คะแนนแล้ว</th>
                    <th className="px-5 py-3 text-center">รวมคะแนน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {Object.entries(report.byPerson)
                    .sort((a, b) => b[1].totalScore - a[1].totalScore)
                    .map(([name, stat]) => (
                      <tr key={name} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-800">{name}</td>
                        <td className="px-5 py-3 text-center text-gray-600">{stat.count}</td>
                        <td className="px-5 py-3 text-center text-gray-600">{stat.scoredCount}</td>
                        <td className="px-5 py-3 text-center font-bold text-purple-700">{stat.totalScore}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {report.logs.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-700">รายการงานทั้งหมด</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <th className="px-5 py-3 text-left">วันที่สร้าง</th>
                      <th className="px-5 py-3 text-left">วันที่ทำงาน</th>
                      <th className="px-5 py-3 text-left">รายการทีวี</th>
                      <th className="px-5 py-3 text-left">ประเภท</th>
                      <th className="px-5 py-3 text-left">ทำโดย</th>
                      <th className="px-5 py-3 text-left">รายละเอียด</th>
                      <th className="px-5 py-3 text-center">คะแนน</th>
                      <th className="px-5 py-3 text-left">ความเห็น</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {report.logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedLog(log)}>
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(log.date)}</td>
                        <td className="px-5 py-3 font-medium text-gray-800">{log.tvShow?.name ?? "-"}</td>
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{log.category?.name ?? "-"}</td>
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{log.doneBy}</td>
                        <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{log.details}</td>
                        <td className="px-5 py-3 text-center">
                          <ScoreBadge score={log.score?.score ?? null} />
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{log.score?.comment ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {report.logs.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
              ไม่มีรายการงานในเดือนนี้
            </div>
          )}
        </div>
      ) : null}

      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">รายละเอียดงาน</h3>
                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">วันที่สร้าง</span>
                  <span className="text-sm font-medium">{formatDateTime(selectedLog.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">วันที่ทำงาน</span>
                  <span className="text-sm font-medium">{formatDateTime(selectedLog.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">รายการทีวี</span>
                  <span className="text-sm font-medium">{selectedLog.tvShow?.name ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ประเภท</span>
                  <span className="text-sm font-medium">{selectedLog.category?.name ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ทำโดย</span>
                  <span className="text-sm font-medium">{selectedLog.doneBy}</span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500 block mb-1">รายละเอียด</span>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedLog.details}</p>
                </div>
                {selectedLog.score && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">คะแนน</span>
                      <span className={`text-sm font-bold ${selectedLog.score.score >= 8 ? "text-green-600" : selectedLog.score.score >= 5 ? "text-yellow-600" : "text-red-500"}`}>
                        {selectedLog.score.score}/10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">ให้คะแนนโดย</span>
                      <span className="text-sm font-medium">{selectedLog.score.scoredBy}</span>
                    </div>
                    {selectedLog.score.comment && (
                      <div className="pt-2">
                        <span className="text-sm text-gray-500 block mb-1">ความเห็น</span>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedLog.score.comment}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
