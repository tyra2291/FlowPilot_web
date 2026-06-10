import { useState } from "react"
import { useSchedule, ScheduleBlock } from "../hooks/useSchedule"
import { useCategories } from "../hooks/useCategories"
import { useSubscription } from "../hooks/useSubscription"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import Background from "../components/Background"
import { useNavigate } from "react-router-dom"

const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const DAYS_FULL  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

const fmt = (s: number) => {
  const m = Math.floor(s / 60); return `${m}m`
}

export default function Schedule() {
  const { t } = useTranslation()
  const { settings, th } = useTheme()
  const navigate = useNavigate()
  const { blocks, loading, addBlock, updateBlock, deleteBlock } = useSchedule()
  const { categories } = useCategories()
  const { isPremium } = useSubscription()

  const today = new Date().getDay()
  const [view, setView] = useState<"day" | "week">("day")
  const [selectedDow, setSelectedDow] = useState(today)
  const [formOpen, setFormOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null)

  const [fTitle, setFTitle]       = useState("")
  const [fTime, setFTime]         = useState("09:00")
  const [fDuration, setFDuration] = useState("25")
  const [fCatName, setFCatName]   = useState("")
  const [fCatColor, setFCatColor] = useState("")

  const openAdd = () => {
    setEditingBlock(null)
    setFTitle(""); setFTime("09:00"); setFDuration("25")
    setFCatName(categories[0]?.name ?? ""); setFCatColor(categories[0]?.color ?? "")
    setFormOpen(true)
  }

  const openEdit = (b: ScheduleBlock) => {
    setEditingBlock(b)
    setFTitle(b.title || ""); setFTime(b.start_time); setFDuration(String(Math.round(b.duration_seconds / 60)))
    setFCatName(b.category_name); setFCatColor(b.category_color)
    setFormOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fCatName) return
    const payload = {
      title: fTitle || null, category_name: fCatName, category_color: fCatColor,
      duration_seconds: (parseInt(fDuration) || 25) * 60,
      start_time: fTime, day_of_week: selectedDow,
    }
    if (editingBlock) await updateBlock(editingBlock.id, payload)
    else await addBlock(payload)
    setFormOpen(false); setEditingBlock(null)
  }

  const daysToShow = view === "day" ? [selectedDow] : [0,1,2,3,4,5,6]

  const input: React.CSSProperties = {
    padding: "10px 14px", borderRadius: 8, border: `1px solid ${th.border}`,
    background: "transparent", color: th.text, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box",
  }

  return (
    <Background settings={settings} style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
          <h1 style={{ color: th.text, fontSize: 18, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", margin: 0 }}>{t.schedule}</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("day")} style={pillBtn(th, view === "day")}>{t.day}</button>
            <button
              onClick={() => { if (!isPremium) { navigate("/upgrade"); return } setView("week") }}
              style={pillBtn(th, view === "week")}
            >
              {t.week}{!isPremium ? " 🔒" : ""}
            </button>
          </div>
        </div>

        {/* Day tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
          {DAYS_SHORT.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedDow(i)}
              style={{
                flex: 1, minWidth: 36, padding: "8px 4px", borderRadius: 8,
                border: `1px solid ${selectedDow === i ? th.text : th.border}`,
                background: selectedDow === i ? th.text : "none",
                color: selectedDow === i ? th.inv : (i === today ? th.sub : th.muted),
                fontSize: 12, cursor: "pointer", letterSpacing: 0.5,
                fontWeight: i === today ? 600 : 400,
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Block list */}
        {loading && <p style={{ color: th.sub }}>{t.loading}</p>}
        {daysToShow.map((dow) => {
          const dayBlocks = blocks.filter((b) => b.day_of_week === dow)
          return (
            <div key={dow}>
              {view === "week" && (
                <div style={{ color: th.sub, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, marginTop: 16 }}>
                  {DAYS_FULL[dow]}{dow === today ? ` · ${t.todayBadge}` : ""}
                </div>
              )}
              {dayBlocks.length === 0 && view === "day" && (
                <p style={{ color: th.muted, fontSize: 13, textAlign: "center", margin: "24px 0" }}>{t.noBlocksForDay}</p>
              )}
              {dayBlocks.map((b) => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, marginBottom: 6, background: th.card, cursor: "pointer" }} onClick={() => openEdit(b)}>
                  <div style={{ width: 10, height: 10, borderRadius: 5, background: b.category_color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ color: th.text, fontSize: 14 }}>{b.title || b.category_name}</span>
                    <span style={{ color: th.muted, fontSize: 12, marginLeft: 8 }}>{b.start_time} · {fmt(b.duration_seconds)}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm(t.deleteBlockConfirm(b.title || b.category_name, b.start_time))) deleteBlock(b.id) }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#FF6584", fontSize: 16, padding: 4 }}
                  >×</button>
                </div>
              ))}
            </div>
          )
        })}

        {/* Add button */}
        <button onClick={openAdd} style={{ width: "100%", marginTop: 12, padding: "14px", borderRadius: 10, border: `1px solid ${th.border}`, background: "none", color: th.sub, fontSize: 14, cursor: "pointer", textAlign: "left" }}>
          + {t.addTo(DAYS_FULL[selectedDow])}
        </button>

        {/* Form */}
        {formOpen && (
          <div style={{ marginTop: 16, padding: 20, borderRadius: 12, border: `1px solid ${th.border}`, background: th.card }}>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={labelStyle(th)}>{t.titleOptional}</div>
                  <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} style={input} />
                </div>
                <div style={{ width: 110 }}>
                  <div style={labelStyle(th)}>{t.startTime}</div>
                  <input type="time" value={fTime} onChange={(e) => setFTime(e.target.value)} style={input} required />
                </div>
                <div style={{ width: 90 }}>
                  <div style={labelStyle(th)}>Min</div>
                  <input type="number" value={fDuration} onChange={(e) => setFDuration(e.target.value)} min={1} style={input} required />
                </div>
              </div>

              <div>
                <div style={labelStyle(th)}>{t.categoryField}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {categories.map((cat) => (
                    <button
                      key={cat.id} type="button"
                      onClick={() => { setFCatName(cat.name); setFCatColor(cat.color) }}
                      style={{
                        background: "none", cursor: "pointer", padding: "6px 14px", borderRadius: 100,
                        border: `1px solid ${fCatName === cat.name ? cat.color : th.border}`,
                        color: fCatName === cat.name ? cat.color : th.sub, fontSize: 13,
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, background: th.text, border: "none", borderRadius: 100, padding: "12px", color: th.inv, fontSize: 14, cursor: "pointer" }}>
                  {editingBlock ? t.saveChanges : t.add}
                </button>
                <button type="button" onClick={() => { setFormOpen(false); setEditingBlock(null) }} style={{ flex: 1, background: "none", border: `1px solid ${th.border}`, borderRadius: 100, padding: "12px", color: th.sub, fontSize: 14, cursor: "pointer" }}>
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Background>
  )
}

const pillBtn = (th: { text: string; border: string; inv: string }, active: boolean): React.CSSProperties => ({
  background: active ? th.text : "none", border: `1px solid ${th.border}`, borderRadius: 100,
  padding: "8px 20px", color: active ? th.inv : th.text, fontSize: 13, cursor: "pointer", letterSpacing: 1,
})

const labelStyle = (th: { sub: string }): React.CSSProperties => ({
  fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: th.sub, marginBottom: 6,
})
