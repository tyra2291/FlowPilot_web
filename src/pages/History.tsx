import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useSessions, Session } from "../hooks/useSessions"
import { useSubscription } from "../hooks/useSubscription"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import Background from "../components/Background"
import { supabase } from "../lib/supabase"

type Period = "7d" | "30d" | "all" | "custom"

const fmt = (s: number) => {
  const m = Math.floor(s / 60); const sec = s % 60
  return `${m}:${String(sec).padStart(2, "0")}`
}

function groupByDate(sessions: Session[]): { label: string; items: Session[] }[] {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const map = new Map<string, Session[]>()
  for (const s of sessions) {
    const d = new Date(s.completed_at); d.setHours(0, 0, 0, 0)
    const key = d.toISOString()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  }
  return Array.from(map.entries()).map(([key, items]) => {
    const d = new Date(key)
    d.setHours(0, 0, 0, 0)
    const label = d.getTime() === today.getTime() ? "Today"
                : d.getTime() === yesterday.getTime() ? "Yesterday"
                : d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    return { label, items }
  })
}

export default function History() {
  const { t } = useTranslation()
  const { settings, th } = useTheme()
  const navigate = useNavigate()
  const { sessions, setSessions, pruneOldSessions, loadSessions } = useSessions()
  const { isPremium } = useSubscription()
  const [catFilter, setCatFilter] = useState("")
  const [period, setPeriod] = useState<Period>("all")
  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10)
  })
  const [customTo, setCustomTo] = useState(() => new Date().toISOString().slice(0, 10))

  const { from, to } = useMemo(() => {
    if (period === "custom") {
      const f = new Date(customFrom); f.setHours(0, 0, 0, 0)
      const t = new Date(customTo); t.setHours(23, 59, 59, 999)
      return { from: f, to: t }
    }
    const to = new Date(); to.setHours(23, 59, 59, 999)
    const from = new Date()
    if (period === "7d") from.setDate(from.getDate() - 6)
    else if (period === "30d") from.setDate(from.getDate() - 29)
    else from.setFullYear(2000)
    from.setHours(0, 0, 0, 0)
    return { from, to }
  }, [period, customFrom, customTo])

  useEffect(() => {
    if (!isPremium) pruneOldSessions()
    loadSessions()
  }, [])

  const categories = Array.from(new Set(sessions.map((s) => s.category_name))).sort()
  const filtered = useMemo(() => {
    let result = period !== "all"
      ? sessions.filter(s => { const d = new Date(s.completed_at); return d >= from && d <= to })
      : sessions
    if (catFilter) result = result.filter(s => s.category_name === catFilter)
    return result
  }, [sessions, period, from, to, catFilter])
  const groups = groupByDate(filtered)

  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteSessionConfirm)) return
    const { error } = await supabase.from("sessions").delete().eq("id", id)
    if (!error) setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  const handleDeleteAll = async () => {
    const msg = catFilter
      ? t.deleteAllFilteredConfirm.replace("{n}", String(filtered.length))
      : t.deleteAllConfirm
    if (!confirm(msg)) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    let query = supabase.from("sessions").delete().eq("user_id", user.id)
    if (catFilter) {
      const ids = filtered.map((s) => s.id)
      const { error } = await supabase.from("sessions").delete().in("id", ids)
      if (!error) setSessions((prev) => prev.filter((s) => s.category_name !== catFilter))
    } else {
      const { error } = await query
      if (!error) setSessions([])
    }
  }

  const exportCSV = () => {
    if (!isPremium) { navigate("/upgrade"); return }
    const header = "date,title,category,duration_s,elapsed_s,completed"
    const rows = filtered.map((s) =>
      `${s.completed_at},"${s.title ?? ""}","${s.category_name}",${s.duration_seconds},${s.elapsed_seconds},${s.completed}`
    )
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "flowpilot_sessions.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const pillBtn = (active: boolean): React.CSSProperties => ({
    background: active ? th.text : "none",
    border: `1px solid ${th.border}`,
    borderRadius: 100,
    padding: "6px 14px",
    color: active ? th.inv : th.sub,
    fontSize: 12,
    cursor: "pointer",
    letterSpacing: 1,
    whiteSpace: "nowrap",
  })

  return (
    <Background settings={settings} style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
          <h1 style={{ color: th.text, fontSize: 18, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", margin: 0 }}>{t.history}</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportCSV} style={pillBtn(false)}>{t.exportCSV}</button>
            <button onClick={handleDeleteAll} style={{ ...pillBtn(false), color: "#FF6584", borderColor: "#FF6584" }}>{t.deleteAll}</button>
          </div>
        </div>

        {/* Period filter */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: period === "custom" ? 10 : 0 }}>
            {(["7d","30d","all","custom"] as Period[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} style={pillBtn(period === p)}>
                {p === "7d" ? t.thisWeek : p === "30d" ? t.thisMonth : p === "all" ? t.allTimeShort : t.customPeriod}
              </button>
            ))}
          </div>
          {period === "custom" && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ color: th.sub, fontSize: 13 }}>{t.dateFrom}</span>
              <input type="date" value={customFrom} max={customTo}
                onChange={e => setCustomFrom(e.target.value)} style={dateInputStyle(th)} />
              <span style={{ color: th.sub, fontSize: 13 }}>{t.dateTo}</span>
              <input type="date" value={customTo} min={customFrom} max={new Date().toISOString().slice(0, 10)}
                onChange={e => setCustomTo(e.target.value)} style={dateInputStyle(th)} />
            </div>
          )}
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <button onClick={() => setCatFilter("")} style={pillBtn(catFilter === "")}>{t.allCategories}</button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCatFilter(cat)} style={pillBtn(catFilter === cat)}>{cat}</button>
          ))}
        </div>

        {/* Session groups */}
        {groups.length === 0 && (
          <p style={{ color: th.sub, textAlign: "center", marginTop: 60 }}>
            {catFilter ? t.noSessionsFilter : t.noSessionsYet}
          </p>
        )}

        {groups.map((group) => (
          <div key={group.label} style={{ marginBottom: 24 }}>
            <div style={{ color: th.sub, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{group.label}</div>
            {group.items.map((session) => (
              <div
                key={session.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                  borderRadius: 10, marginBottom: 6, background: th.card, cursor: "pointer",
                }}
                onClick={() => navigate(`/session/${session.id}`)}
              >
                <div style={{ width: 10, height: 10, borderRadius: 5, background: session.category_color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: th.text, fontSize: 14, fontWeight: 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {session.title || session.category_name}
                  </div>
                  <div style={{ color: th.muted, fontSize: 12, marginTop: 2 }}>
                    {session.category_name} · {fmt(session.elapsed_seconds)} / {fmt(session.duration_seconds)}
                    {" "}· {session.completed ? "✓" : "✗"}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(session.id) }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#FF6584", fontSize: 16, padding: 4 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ))}

        {!isPremium && sessions.length > 0 && (
          <p style={{ color: th.muted, fontSize: 12, textAlign: "center", marginTop: 16 }}>{t.historyLimitNote}</p>
        )}
      </div>
    </Background>
  )
}

const dateInputStyle = (th: any): React.CSSProperties => ({
  background: th.card, color: th.text, border: `1px solid ${th.border}`,
  borderRadius: 8, padding: "6px 10px", fontSize: 13, cursor: "pointer",
  outline: "none", colorScheme: "dark" as any,
})
