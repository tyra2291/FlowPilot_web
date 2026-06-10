import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuickTimers } from "../hooks/useQuickTimers"
import { useSubscription } from "../hooks/useSubscription"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import Background from "../components/Background"

const FREE_LIMIT = 4

export default function QuickTimers() {
  const { t } = useTranslation()
  const { settings, th } = useTheme()
  const navigate = useNavigate()
  const { quickTimers, loading, addQuickTimer, deleteQuickTimer, reorderQuickTimers } = useQuickTimers()
  const { isPremium } = useSubscription()

  const [label, setLabel]     = useState("")
  const [minutes, setMinutes] = useState("")

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const min = parseInt(minutes)
    if (!label.trim() || !min || min <= 0) return
    if (!isPremium && quickTimers.length >= FREE_LIMIT) { navigate("/upgrade"); return }
    await addQuickTimer(label.trim(), min * 60)
    setLabel(""); setMinutes("")
  }

  const input: React.CSSProperties = {
    padding: "12px 16px", borderRadius: 10, border: `1px solid ${th.border}`,
    background: "transparent", color: th.text, fontSize: 15, outline: "none",
  }

  return (
    <Background settings={settings} style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ color: th.text, fontSize: 18, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", marginBottom: 24 }}>{t.quickTimers}</h1>

        <form onSubmit={handleAdd} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 32, flexWrap: "wrap" }}>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t.labelPlaceholder} style={{ ...input, flex: 1, minWidth: 140 }} />
          <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder={t.durationMinutesPlaceholder} style={{ ...input, width: 80 }} min={1} />
          <button type="submit" style={{ background: th.text, border: "none", borderRadius: 100, padding: "12px 24px", color: th.inv, fontSize: 14, cursor: "pointer", letterSpacing: 1, whiteSpace: "nowrap" }}>
            {t.addQuickTimer}
          </button>
        </form>

        {loading && <p style={{ color: th.sub }}>{t.loading}</p>}
        {quickTimers.map((timer, i) => (
          <div key={timer.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, marginBottom: 6, background: th.card }}>
            <div style={{ flex: 1 }}>
              <span style={{ color: th.text, fontSize: 15 }}>{timer.label}</span>
              <span style={{ color: th.muted, fontSize: 13, marginLeft: 8 }}>— {Math.round(timer.seconds / 60)} min</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => reorderQuickTimers(timer.id, "up")} disabled={i === 0} style={iconBtn(th)}>↑</button>
              <button onClick={() => reorderQuickTimers(timer.id, "down")} disabled={i === quickTimers.length - 1} style={iconBtn(th)}>↓</button>
              <button onClick={() => confirm(t.deleteTimerConfirm(timer.label)) && deleteQuickTimer(timer.id)} style={{ ...iconBtn(th), color: "#FF6584" }}>×</button>
            </div>
          </div>
        ))}

        {!isPremium && (
          <p style={{ color: th.muted, fontSize: 12, textAlign: "center", marginTop: 16 }}>
            {quickTimers.length >= FREE_LIMIT ? t.freeLimitReached : `${quickTimers.length} / ${FREE_LIMIT}`}
          </p>
        )}
      </div>
    </Background>
  )
}

const iconBtn = (th: { border: string; sub: string }): React.CSSProperties => ({
  background: "none", border: `1px solid ${th.border}`, borderRadius: 6,
  width: 28, height: 28, cursor: "pointer", color: th.sub, fontSize: 14,
  display: "flex", alignItems: "center", justifyContent: "center",
})
