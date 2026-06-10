import { useState } from "react"
import { useSubscription } from "../hooks/useSubscription"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import { supabase } from "../lib/supabase"
import Background from "../components/Background"

const FEATURES = (t: any) => [
  t.featureSchedule, t.featureHistory, t.featureCategories,
  t.featureTimers, t.featurePeriods,
]

export default function Upgrade() {
  const { t } = useTranslation()
  const { settings, th } = useTheme()
  const { isPremium, refresh } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const handleBuy = async () => {
    setLoading(true); setError("")
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Please sign in first.")
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { user_id: user.id, email: user.email },
      })
      if (error) throw error
      window.open(data.url, "_blank")
      setTimeout(() => refresh(), 3000)
    } catch (e: any) {
      setError(e.message ?? "An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  if (isPremium) {
    return (
      <Background settings={settings} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
          <div style={{ color: th.text, fontSize: 22, marginBottom: 8 }}>{t.premium}</div>
          <div style={{ color: th.sub }}>{t.cancelAnytime}</div>
        </div>
      </Background>
    )
  }

  return (
    <Background settings={settings} style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
        <h1 style={{ color: th.text, fontSize: 24, fontWeight: 300, marginBottom: 8 }}>{t.goPremium}</h1>
        <p style={{ color: th.sub, marginBottom: 32 }}>{t.premiumSubtitle}</p>

        <div style={{ textAlign: "left", marginBottom: 32 }}>
          {FEATURES(t).map((f: string) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${th.border}` }}>
              <span style={{ color: "#6C63FF", fontSize: 18 }}>✓</span>
              <span style={{ color: th.text, fontSize: 15 }}>{f}</span>
            </div>
          ))}
        </div>

        <div style={{ color: th.text, fontSize: 32, fontWeight: 300, marginBottom: 8 }}>{t.premiumPrice}</div>
        <div style={{ color: th.muted, fontSize: 13, marginBottom: 24 }}>{t.cancelAnytime}</div>

        {error && <p style={{ color: "#FF6584", marginBottom: 16 }}>{error}</p>}

        <button
          onClick={handleBuy}
          disabled={loading}
          style={{ background: "#6C63FF", border: "none", borderRadius: 100, padding: "16px 48px", color: "#fff", fontSize: 16, cursor: "pointer", letterSpacing: 1, opacity: loading ? 0.6 : 1, width: "100%" }}
        >
          {loading ? t.loading : t.subscribe}
        </button>

        <button
          onClick={() => refresh()}
          style={{ background: "none", border: "none", cursor: "pointer", color: th.muted, fontSize: 13, marginTop: 16, padding: 0 }}
        >
          {t.restoreStatus}
        </button>
      </div>
    </Background>
  )
}
