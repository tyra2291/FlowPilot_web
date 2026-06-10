import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useCategories } from "../hooks/useCategories"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import Background from "../components/Background"

export default function SessionEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { categories } = useCategories()
  const { settings, th } = useTheme()
  const { t } = useTranslation()

  const [title, setTitle]             = useState("")
  const [categoryName, setCategoryName] = useState("")
  const [categoryColor, setCategoryColor] = useState("")
  const [elapsedMin, setElapsedMin]   = useState("0")
  const [elapsedSec, setElapsedSec]   = useState("00")
  const [durationMin, setDurationMin] = useState("0")
  const [durationSec, setDurationSec] = useState("00")
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from("sessions").select("*").eq("id", id).single().then(({ data }) => {
      if (!data) return
      setTitle(data.title || "")
      setCategoryName(data.category_name)
      setCategoryColor(data.category_color)
      setElapsedMin(String(Math.floor(data.elapsed_seconds / 60)))
      setElapsedSec(String(data.elapsed_seconds % 60).padStart(2, "0"))
      setDurationMin(String(Math.floor(data.duration_seconds / 60)))
      setDurationSec(String(data.duration_seconds % 60).padStart(2, "0"))
      setLoading(false)
    })
  }, [id])

  const toSec = (min: string, sec: string) => (parseInt(min) || 0) * 60 + Math.min(59, parseInt(sec) || 0)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const { error } = await supabase.from("sessions").update({
      title: title || null, category_name: categoryName, category_color: categoryColor,
      elapsed_seconds: toSec(elapsedMin, elapsedSec), duration_seconds: toSec(durationMin, durationSec),
    }).eq("id", id!)
    if (!error) navigate("/history")
    else setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm(t.deleteSessionConfirm)) return
    const { error } = await supabase.from("sessions").delete().eq("id", id!)
    if (!error) navigate("/history")
  }

  const input: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10, border: `1px solid ${th.border}`,
    background: "transparent", color: th.text, fontSize: 15, outline: "none", boxSizing: "border-box",
  }
  const timeInput: React.CSSProperties = {
    flex: 1, padding: "12px 8px", borderRadius: 8, border: `1px solid ${th.border}`,
    background: "transparent", color: th.text, fontSize: 18, fontWeight: 500, textAlign: "center", outline: "none",
  }

  if (loading) return (
    <Background settings={settings} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: th.sub }}>{t.loading}</p>
    </Background>
  )

  return (
    <Background settings={settings} style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6C63FF", fontSize: 24, padding: 0 }}>‹</button>
          <h1 style={{ color: th.text, fontSize: 18, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", margin: 0 }}>{t.editSession}</h1>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Title */}
          <div>
            <div style={label(th)}>{t.titleField}</div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titleOptional} style={input} />
          </div>

          {/* Category */}
          <div>
            <div style={label(th)}>{t.categoryField}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {categories.map((cat) => (
                <button
                  key={cat.id} type="button"
                  onClick={() => { setCategoryName(cat.name); setCategoryColor(cat.color) }}
                  style={{
                    background: "none", cursor: "pointer", padding: "6px 14px", borderRadius: 100,
                    border: `1px solid ${categoryName === cat.name ? cat.color : th.border}`,
                    color: categoryName === cat.name ? cat.color : th.sub, fontSize: 13,
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Time fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={label(th)}>{t.timeSpent}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input value={elapsedMin} onChange={(e) => setElapsedMin(e.target.value.replace(/\D/g, ""))} style={timeInput} maxLength={3} />
                <span style={{ color: th.text, fontSize: 20, fontWeight: 700 }}>:</span>
                <input value={elapsedSec} onChange={(e) => setElapsedSec(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  onBlur={() => setElapsedSec(String(Math.min(59, parseInt(elapsedSec) || 0)).padStart(2, "0"))}
                  style={timeInput} maxLength={2} />
              </div>
            </div>
            <div>
              <div style={label(th)}>{t.durationField}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input value={durationMin} onChange={(e) => setDurationMin(e.target.value.replace(/\D/g, ""))} style={timeInput} maxLength={3} />
                <span style={{ color: th.text, fontSize: 20, fontWeight: 700 }}>:</span>
                <input value={durationSec} onChange={(e) => setDurationSec(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  onBlur={() => setDurationSec(String(Math.min(59, parseInt(durationSec) || 0)).padStart(2, "0"))}
                  style={timeInput} maxLength={2} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ background: "none", border: `1px solid ${saving ? th.border : th.text}`, borderRadius: 100, padding: "16px", color: saving ? th.sub : th.text, fontSize: 16, cursor: "pointer", letterSpacing: 2, marginTop: 8 }}>
            {saving ? t.saving : t.saveChanges}
          </button>
        </form>

        <button onClick={handleDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#FF6584", fontSize: 15, padding: "16px 0", width: "100%", marginTop: 8 }}>
          {t.deleteSession}
        </button>
      </div>
    </Background>
  )
}

const label = (th: { sub: string }): React.CSSProperties => ({
  fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: th.sub, marginBottom: 8,
})
