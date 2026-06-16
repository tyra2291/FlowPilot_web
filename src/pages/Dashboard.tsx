import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useSessions, Session } from "../hooks/useSessions"
import { useSubscription } from "../hooks/useSubscription"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import Background from "../components/Background"

type Period = "1d" | "7d" | "30d" | "all" | "custom"

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

function DonutChart({ catTotals, th }: { catTotals: Record<string, { seconds: number; color: string }>; th: any }) {
  const entries = Object.entries(catTotals).sort((a, b) => b[1].seconds - a[1].seconds)
  const total = entries.reduce((sum, [, v]) => sum + v.seconds, 0)
  if (total === 0 || entries.length === 0) return null
  const R = 140
  const C = 2 * Math.PI * R
  let cum = 0
  const slices = entries.map(([name, { seconds, color }]) => {
    const f = seconds / total
    const dashLen = f * C
    const dashOffset = C / 4 - cum * C
    cum += f
    return { name, color, dashLen, dashOffset }
  })
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <svg width={320} height={320} viewBox="0 0 400 400">
        <circle cx={200} cy={200} r={R} fill="none" stroke={th.track} strokeWidth={44} />
        {slices.map(({ name, color, dashLen, dashOffset }) => (
          <circle key={name} cx={200} cy={200} r={R} fill="none" stroke={color}
            strokeWidth={44} strokeDasharray={`${dashLen} ${C - dashLen}`} strokeDashoffset={dashOffset} />
        ))}
        <text x={200} y={190} textAnchor="middle" fill={th.text} fontSize={36} fontWeight="300">{fmtH(total)}</text>
        <text x={200} y={220} textAnchor="middle" fill={th.muted} fontSize={16} letterSpacing={3}>TOTAL</text>
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", justifyContent: "center", maxWidth: 500 }}>
        {entries.map(([name, { seconds, color }]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ color: th.sub, fontSize: 13 }}>{name}</span>
            <span style={{ color: th.muted, fontSize: 12 }}>{Math.round(seconds / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

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
    if (period === "1d") { /* today only — from = today midnight */ }
    else if (period === "7d") from.setDate(from.getDate() - 6)
    else if (period === "30d") from.setDate(from.getDate() - 29)
    else from.setFullYear(2000)
    from.setHours(0, 0, 0, 0)
    return { from, to }
  }, [period, customFrom, customTo])

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

        {/* Period pills + optional custom date inputs */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: period === "custom" ? 12 : 0 }}>
            {(["1d","7d","30d","all","custom"] as Period[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} style={pill(th, period === p)}>
                {p === "1d" ? t.todayLabel : p === "7d" ? t.thisWeek : p === "30d" ? t.thisMonth : p === "all" ? t.allTimeShort : t.customPeriod}
              </button>
            ))}
          </div>
          {period === "custom" && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ color: th.sub, fontSize: 13 }}>{t.dateFrom}</span>
              <input type="date" value={customFrom} max={customTo}
                onChange={e => setCustomFrom(e.target.value)} style={dateInput(th)} />
              <span style={{ color: th.sub, fontSize: 13 }}>{t.dateTo}</span>
              <input type="date" value={customTo} min={customFrom} max={new Date().toISOString().slice(0, 10)}
                onChange={e => setCustomTo(e.target.value)} style={dateInput(th)} />
            </div>
          )}
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

            {/* By category — bar charts */}
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

            {/* Distribution donut — at the bottom, larger */}
            <DonutChart catTotals={stats.catTotals} th={th} />
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

const dateInput = (th: any): React.CSSProperties => ({
  background: th.card, color: th.text, border: `1px solid ${th.border}`,
  borderRadius: 8, padding: "6px 10px", fontSize: 13, cursor: "pointer",
  outline: "none", colorScheme: "dark" as any,
})
