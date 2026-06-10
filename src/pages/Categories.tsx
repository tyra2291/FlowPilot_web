import { useState } from "react"
import { useCategories } from "../hooks/useCategories"
import { useSubscription } from "../hooks/useSubscription"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import Background from "../components/Background"
import { useNavigate } from "react-router-dom"

const FREE_LIMIT = 4

const PALETTE = [
  "#6C63FF","#FF6584","#43B89C","#F9A825","#2196F3","#FF5722",
  "#9C27B0","#4CAF50","#FF9800","#00BCD4","#E91E63","#607D8B",
]

export default function Categories() {
  const { t } = useTranslation()
  const { settings, th } = useTheme()
  const navigate = useNavigate()
  const { categories, loading, addCategory, deleteCategory, reorderCategories } = useCategories()
  const { isPremium } = useSubscription()

  const [name, setName]   = useState("")
  const [color, setColor] = useState(PALETTE[0])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!isPremium && categories.length >= FREE_LIMIT) {
      navigate("/upgrade"); return
    }
    await addCategory(name.trim(), color)
    setName("")
  }

  const input: React.CSSProperties = {
    flex: 1, padding: "12px 16px", borderRadius: 10, border: `1px solid ${th.border}`,
    background: "transparent", color: th.text, fontSize: 15, outline: "none",
  }

  return (
    <Background settings={settings} style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ color: th.text, fontSize: 18, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", marginBottom: 24 }}>{t.categories}</h1>

        {/* Add form */}
        <form onSubmit={handleAdd} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.newCategoryName} style={input} />
            <button
              type="submit"
              style={{ background: th.text, border: "none", borderRadius: 100, padding: "12px 24px", color: th.inv, fontSize: 14, cursor: "pointer", letterSpacing: 1, whiteSpace: "nowrap" }}
            >
              {t.addCategory}
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PALETTE.map((c) => (
              <div
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 28, height: 28, borderRadius: 14, background: c, cursor: "pointer",
                  border: color === c ? "3px solid #fff" : "3px solid transparent",
                  boxSizing: "border-box",
                }}
              />
            ))}
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              style={{ width: 28, height: 28, borderRadius: 14, border: "none", cursor: "pointer", padding: 0, background: "none" }} />
          </div>
        </form>

        {/* List */}
        {loading && <p style={{ color: th.sub }}>{t.loading}</p>}
        {categories.map((cat, i) => (
          <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, marginBottom: 6, background: th.card }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: cat.color, flexShrink: 0 }} />
            <span style={{ flex: 1, color: th.text, fontSize: 15 }}>{cat.name}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => reorderCategories(cat.id, "up")} disabled={i === 0} style={iconBtn(th)}>↑</button>
              <button onClick={() => reorderCategories(cat.id, "down")} disabled={i === categories.length - 1} style={iconBtn(th)}>↓</button>
              <button onClick={() => confirm(t.deleteConfirm(cat.name)) && deleteCategory(cat.id)} style={{ ...iconBtn(th), color: "#FF6584" }}>×</button>
            </div>
          </div>
        ))}

        {!isPremium && (
          <p style={{ color: th.muted, fontSize: 12, textAlign: "center", marginTop: 16 }}>
            {categories.length >= FREE_LIMIT ? t.freeLimitReached : `${categories.length} / ${FREE_LIMIT}`}
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
