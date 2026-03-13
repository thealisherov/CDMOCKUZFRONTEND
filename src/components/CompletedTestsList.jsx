"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, BarChart3, Clock, FileText, ChevronLeft, ChevronRight, Filter, ArrowLeft } from "lucide-react";

const SCORE_FILTERS = [
  { key: "all", label: "All scores" },
  { key: "below40", label: "Below 40%" },
  { key: "40to70", label: "40% – 70%" },
  { key: "above70", label: "Above 70%" },
];

function getBandColor(band) {
  if (band >= 8)   return { bg: 'oklch(0.52 0.16 145 / 0.12)', text: 'oklch(0.42 0.14 145)', border: 'oklch(0.52 0.16 145 / 0.3)' };
  if (band >= 7)   return { bg: 'oklch(0.55 0.2 240 / 0.12)', text: 'oklch(0.45 0.18 240)', border: 'oklch(0.55 0.2 240 / 0.3)' };
  if (band >= 6)   return { bg: 'oklch(0.6 0.2 60 / 0.12)', text: 'oklch(0.5 0.18 60)', border: 'oklch(0.6 0.2 60 / 0.3)' };
  if (band >= 5)   return { bg: 'oklch(0.72 0.17 80 / 0.12)', text: 'oklch(0.55 0.15 80)', border: 'oklch(0.72 0.17 80 / 0.3)' };
  return           { bg: 'oklch(0.55 0.22 25 / 0.12)', text: 'oklch(0.45 0.2 25)', border: 'oklch(0.55 0.22 25 / 0.3)' };
}

function formatTimeSpent(seconds) {
  if (!seconds) return "< 1 min";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s > 0 ? s + 's' : ''}`.trim();
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
    + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function CompletedTestsList({ moduleType = "reading" }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetch(`/api/attempts?type=${moduleType}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setAttempts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [moduleType]);

  const isWriting = moduleType === 'writing';

  const filtered = useMemo(() => {
    let result = attempts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => (a.test_title || '').toLowerCase().includes(q));
    }
    if (scoreFilter !== "all" && !isWriting) {
      result = result.filter(a => {
        const pct = a.total_questions > 0 ? (a.correct_count / a.total_questions) * 100 : 0;
        switch (scoreFilter) {
          case "below40": return pct < 40;
          case "40to70": return pct >= 40 && pct <= 70;
          case "above70": return pct > 70;
          default: return true;
        }
      });
    }
    return result;
  }, [attempts, searchQuery, scoreFilter, isWriting]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const summary = useMemo(() => {
    if (attempts.length === 0) return null;
    if (isWriting) {
      const validBands = attempts.map(a => a.band_score || 0).filter(b => b > 0);
      const avgBand = validBands.length ? (validBands.reduce((s, b) => s + b, 0) / validBands.length).toFixed(1) : "N/A";
      const bestBand = validBands.length ? Math.max(...validBands).toFixed(1) : "N/A";
      return { total: attempts.length, avgScore: `${avgBand} Band`, bestScore: `${bestBand} Band` };
    }
    return {
      total: attempts.length,
      avgScore: Math.round(attempts.reduce((s, a) => s + (a.total_questions > 0 ? (a.correct_count / a.total_questions) * 100 : 0), 0) / attempts.length) + "%",
      bestScore: Math.round(Math.max(...attempts.map(a => a.total_questions > 0 ? (a.correct_count / a.total_questions) * 100 : 0))) + "%",
    };
  }, [attempts, isWriting]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: 'var(--primary)' }} />
      </div>
    );
  }

  if (attempts.length === 0) return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <a href={`/dashboard/${moduleType}`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Tests
        </a>
      </div>
      <div className="text-center py-20 border rounded-xl" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>No attempts found</p>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>You haven't completed any {moduleType} tests yet.</p>
      </div>
    </div>
  );

  const moduleColor = moduleType === 'listening' ? 'oklch(0.52 0.2 170)' : moduleType === 'writing' ? 'oklch(0.6 0.2 60)' : 'oklch(0.55 0.2 240)';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <a href={`/dashboard/${moduleType}`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Tests
        </a>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
            style={{ background: `${moduleColor}20` }}>
            <BarChart3 className="w-5 h-5" style={{ color: moduleColor }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
              Your attempts
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              You have completed {attempts.length} {moduleType} attempt{attempts.length !== 1 ? 's' : ''} in total.
            </p>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1 rounded-lg hover:bg-muted disabled:opacity-30 transition-all"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1 rounded-lg hover:bg-muted disabled:opacity-30 transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {/* Filters + Summary */}
      <div className="flex flex-wrap gap-4 items-start">
        {/* Left: Filters */}
        <div className="space-y-3 min-w-[180px]" style={{ maxWidth: 200 }}>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          {/* Score range (only for reading/listening) */}
          {!isWriting && (
            <div>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Score range</p>
            <div className="flex flex-wrap gap-1.5">
              {SCORE_FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => { setScoreFilter(f.key); setPage(1); }}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={scoreFilter === f.key
                    ? { background: moduleColor, color: '#fff' }
                    : { background: 'var(--muted)', color: 'var(--muted-foreground)' }
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                This page summary
              </p>
              {[
                { icon: <BarChart3 className="w-3.5 h-3.5" />, label: "Attempts", value: summary.total },
                { icon: <FileText className="w-3.5 h-3.5" />, label: "Avg score", value: summary.avgScore },
                { icon: <Clock className="w-3.5 h-3.5" />, label: "Best score", value: summary.bestScore },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>{s.icon} {s.label}</span>
                  <span className="font-bold" style={{ color: 'var(--foreground)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Attempts List */}
        <div className="flex-1 space-y-3 min-w-0">
          {paginated.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No attempts match your filters.
            </div>
          ) : (
            paginated.map((attempt) => {
              const pct = attempt.total_questions > 0 ? Math.round((attempt.correct_count / attempt.total_questions) * 100) : 0;
              const bandC = getBandColor(attempt.band_score || 0);

              return (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-sm"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {/* Title row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[15px] truncate" style={{ color: 'var(--foreground)' }}>
                        {attempt.test_title}
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `${moduleColor}15`, color: moduleColor }}>
                        Full Test
                      </span>
                      {attempt.band_score && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: bandC.bg, color: bandC.text, border: `1px solid ${bandC.border}` }}>
                          {pct}%
                        </span>
                      )}
                    </div>
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-[12px] flex-wrap" style={{ color: 'var(--muted-foreground)' }}>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {isWriting ? (attempt.band_score ? `Band ${attempt.band_score}` : 'Evaluated') : `${attempt.correct_count}/${attempt.total_questions} correct`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Completed at {formatDate(attempt.completed_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        ⏱ Time spent {formatTimeSpent(attempt.time_spent_seconds)}
                      </span>
                    </div>
                  </div>

                  {/* Review button */}
                  <a
                    href={`/dashboard/${moduleType}/${attempt.test_numeric_id}/review/${attempt.id}`}
                    className="ml-4 shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--card)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = moduleColor; e.currentTarget.style.color = moduleColor; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--foreground)'; }}
                  >
                    <BarChart3 className="w-4 h-4" /> Review attempt
                  </a>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
