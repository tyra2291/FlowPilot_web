import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useSessions, Session } from "../hooks/useSessions"
import { useSubscription } from "../hooks/useSubscription"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import Background from "../components/Background"

type Period = "7d" | "30d" | "all"

function computeStats(sessions: Session[], from: Date, to: Date) {
  const filtered = sessions.filter((s) => {
    const d = new Date(s.completed_at)
    return d >= from && d <= to
  })
  const totalSec = filtered.reduce((acc, s) => acc + s.elapsed_seconds, 0)
  const completed = filtered.filter((s) => s.completed).length
  const rate = filtered.length > 0 ? Math.round((completed / filtered.length) * 100) : 0

  // Best day
  const dayTotals: Record<number, number> = {}
  for (const s of filtered) {
    const d = new Date(s.completed_at).getDay()
    dayTotals[d] = (dayTotals[d] ?? 0) + s.elapsed_seconds
  }
  const bestDay = Object.entries(dayTotals).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0]

  // By category
  const catTotals: Record<string, { seconds: number; color: string }> = {}
  for (const s of filtered) {
    if (!catTotals[s.category_name]) catTotals[s.category_name] = { seconds: 0, color: s.category_color }
    catTotals[s.category_name].seconds += s.elapsed_seconds
  }

  return { totalSec, rate, bestDay: bestDay !== undefined ? Number(bestDay) : null, catTotals, count: filtered.length }
}

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

const fmtH = (s: number) => {
  const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { settings, th } = useTheme()
  const navigate = useNavigate()
  const { sessions } = useSessions()
  const { isPremium } = useSubscription()
  const [period, setPeriod] = useState<Period>("7d")

  const { from, to } = useMemo(() => {
    const to = new Date(); to.setHours(23, 59, 59, 999)
    const from = new Date()
    if (period === "7d") from.setDate(from.getDate() - 6)
    else if (period === "30d") from.setDate(from.getDate() - 29)
    else from.setFullYear(2000)
    from.setHours(0, 0, 0, 0)
    return { from, to }
  }, [period])

  const stats = useMemo(() => computeStats(sessions, from, to), [sessions, from, to])

  if (!isPremium) {
    return (
      <Background settings={settings} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 32 }}>
          <div style={{ color: th.text, fontSize: 22, marginBottom: 12 }}>📊</div>
          <div style={{ color: th.text, fontSize: 18, marginBottom: 8 }}>{t.premiumFeature}</div>
          <div style={{ color: th.sub, fontSize: 14, marginBottom: 24 }}>{t.dashboard}</div>
          <button onClick={() => navigate("/upgrade")} style={{ background: th.text, border: "none", borderRadius: 100, padding: "14px 32px", color: th.inv, fontSize: 15, cursor: "pointer", letterSpacing: 1 }}>
            {t.upgradeNow}
          </button>
        </div>
      </Background>
    )
  }

  const maxCat = Math.max(...Object.values(stats.catTotals).map((c) => c.seconds), 1)

  return (
    <Background settings={settings} style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ color: th.text, fontSize: 18, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", marginBottom: 20 }}>{t.dashboard}</h1>

        {/* Period pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {(["7d","30d","all"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} style={pill(th, period === p)}>
              {p === "7d" ? t.thisWeek : p === "30d" ? t.thisMonth : t.allTimeShort}
            </button>
          ))}
        </div>

        {stats.count === 0 ? (
          <p style={{ color: th.sub, textAlign: "center", marginTop: 60 }}>{t.noData}</p>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: t.timeWorked,      value: fmtH(stats.totalSec) },
                { label: t.completionRate,  value: `${stats.rate}%` },
                { label: t.bestDayLabel,    value: stats.bestDay !== null ? DAYS[stats.bestDay].slice(0, 3) : "—" },
              ].map((card) => (
                <div key={card.label} style={{ background: th.card, borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ color: th.muted, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{card.label}</div>
                  <div style={{ color: th.text, fontSize: 24, fontWeight: 300 }}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* By category */}
            <div style={{ color: th.sub, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{t.byCategory}</div>
            {Object.entries(stats.catTotals).sort((a, b) => b[1].seconds - a[1].seconds).map(([name, { seconds, color }]) => (
              <div key={name} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: th.text, fontSize: 13 }}>{name}</span>
                  <span style={{ color: th.muted, fontSize: 13 }}>{fmtH(seconds)}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: th.track }}>
                  <div style={{ height: 6, borderRadius: 3, background: color, width: `${(seconds / maxCat) * 100}%`, transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </Background>
  )
}

const pill = (th: { text: string; border: string; inv: string }, active: boolean): React.CSSProperties => ({
  background: active ? th.text : "none", border: `1px solid ${th.border}`, borderRadius: 100,
  padding: "8px 20px", color: active ? th.inv : th.text, fontSize: 13, cursor: "pointer",
})
