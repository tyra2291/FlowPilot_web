import { useState, useEffect } from "react"
import { useSchedule, ScheduleBlock } from "../hooks/useSchedule"
import { useCategories } from "../hooks/useCategories"
import { useSubscription } from "../hooks/useSubscription"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import Background from "../components/Background"
import { useNavigate } from "react-router-dom"

const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const DAYS_FULL  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const DUR_OPTIONS = [5,10,15,20,25,30,35,40,45,50,55,60,75,90,105,120,150,180,210,240]

const fmt = (s: number) => {
  const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

const endTime = (start: string, durationSec: number) => {
  const [h, m] = start.split(":").map(Number)
  const total = h * 60 + m + Math.floor(durationSec / 60)
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
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

  const [fillFormOpen, setFillFormOpen] = useState(false)
  const [fillDurMin, setFillDurMin]     = useState(25)
  const [fillCatName, setFillCatName]   = useState("")
  const [fillCatColor, setFillCatColor] = useState("")

  useEffect(() => {
    if (categories.length > 0 && !fillCatName) {
      setFillCatName(categories[0].name); setFillCatColor(categories[0].color)
    }
  }, [categories])

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

  const handleDeleteDay = (dow: number) => {
    const dayBlocks = blocks.filter(b => b.day_of_week === dow)
    if (dayBlocks.length === 0) return
    if (!confirm(t.deleteBlocksDayConfirm(DAYS_FULL[dow]))) return
    dayBlocks.forEach(b => deleteBlock(b.id))
  }

  const handleFill95 = async () => {
    if (!fillCatName) return
    const dur = fillDurMin
    const occupied = blocks
      .filter(b => b.day_of_week === selectedDow)
      .map(b => { const [h, m] = b.start_time.split(":").map(Number); const s = h * 60 + m; return { start: s, end: s + Math.floor(b.duration_seconds / 60) } })
    const toAdd: number[] = []
    let cursor = 9 * 60
    while (cursor + dur <= 17 * 60) {
      const inside = occupied.find(o => o.start <= cursor && cursor < o.end)
      if (inside) { cursor = inside.end; continue }
      const overlap = occupied.find(o => cursor < o.end && o.start < cursor + dur)
      if (overlap) { cursor = overlap.end; continue }
      toAdd.push(cursor); cursor += dur
    }
    if (toAdd.length === 0) { alert(t.fill95Empty); return }
    for (const startMin of toAdd) {
      await addBlock({
        title: null, category_name: fillCatName, category_color: fillCatColor,
        duration_seconds: dur * 60,
        start_time: `${String(Math.floor(startMin / 60)).padStart(2, "0")}:${String(startMin % 60).padStart(2, "0")}`,
        day_of_week: selectedDow,
      })
    }
    setFillFormOpen(false)
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, marginTop: 16 }}>
                  <span style={{ color: th.sub, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>
                    {DAYS_FULL[dow]}{dow === today ? ` · ${t.todayBadge}` : ""}
                  </span>
                  {dayBlocks.length > 0 && (
                    <button onClick={() => handleDeleteDay(dow)} style={{ background: "none", border: "none", cursor: "pointer", color: "#FF6584", fontSize: 12, padding: 0 }}>
                      {t.deleteAll}
                    </button>
                  )}
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
                    <span style={{ color: th.muted, fontSize: 12, marginLeft: 8 }}>{b.start_time} → {endTime(b.start_time, b.duration_seconds)} · {fmt(b.duration_seconds)}</span>
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

        {/* Action buttons: Add, Fill 9–5, Delete day */}
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button onClick={() => { openAdd(); setFillFormOpen(false) }} style={{ flex: 1, minWidth: 120, padding: "12px 16px", borderRadius: 10, border: `1px solid ${th.border}`, background: "none", color: th.sub, fontSize: 14, cursor: "pointer", textAlign: "left" }}>
            + {t.addTo(DAYS_FULL[selectedDow])}
          </button>
          <button
            onClick={() => { setFillFormOpen(v => !v); setFormOpen(false); setEditingBlock(null) }}
            style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${th.border}`, background: fillFormOpen ? th.card : "none", color: th.sub, fontSize: 14, cursor: "pointer" }}
          >
            {t.fill95}
          </button>
          {blocks.filter(b => b.day_of_week === selectedDow).length > 0 && (
            <button onClick={() => handleDeleteDay(selectedDow)} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #FF658440", background: "none", color: "#FF6584", fontSize: 14, cursor: "pointer" }}>
              {t.deleteAll}
            </button>
          )}
        </div>

        {/* Fill 9–5 form */}
        {fillFormOpen && (
          <div style={{ marginTop: 12, padding: 20, borderRadius: 12, border: `1px solid ${th.border}`, background: th.card }}>
            <div style={{ color: th.sub, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>{t.fill95Title}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
              <div>
                <div style={labelStyle(th)}>Min</div>
                <select
                  value={fillDurMin}
                  onChange={e => setFillDurMin(Number(e.target.value))}
                  style={{ ...input, width: "auto", colorScheme: "dark" as any }}
                >
                  {DUR_OPTIONS.map(d => {
                    const h = Math.floor(d / 60); const m = d % 60
                    const label = d < 60 ? `${d}m` : (m > 0 ? `${h}h ${m}m` : `${h}h`)
                    return <option key={d} value={d}>{label}</option>
                  })}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={labelStyle(th)}>{t.categoryField}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {categories.map(cat => (
                    <button key={cat.id} type="button"
                      onClick={() => { setFillCatName(cat.name); setFillCatColor(cat.color) }}
                      style={{ background: "none", cursor: "pointer", padding: "6px 14px", borderRadius: 100, border: `1px solid ${fillCatName === cat.name ? cat.color : th.border}`, color: fillCatName === cat.name ? cat.color : th.sub, fontSize: 13 }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={handleFill95} style={{ background: th.text, border: "none", borderRadius: 100, padding: "10px 28px", color: th.inv, fontSize: 14, cursor: "pointer" }}>
              {t.fill95Apply}
            </button>
          </div>
        )}

        {/* Add / Edit form */}
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
