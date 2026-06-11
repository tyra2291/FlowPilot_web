import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useSubscription } from "../hooks/useSubscription"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import Background from "../components/Background"

export default function Account() {
  const { t } = useTranslation()
  const { settings, th } = useTheme()
  const navigate = useNavigate()
  const { isPremium } = useSubscription()

  const [email, setEmail] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      if (!user) return
      setEmail(user.email ?? "")
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const handleDeleteAccount = async () => {
    if (!confirm(t.deleteAccountConfirm)) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("sessions").delete().eq("user_id", user.id)
    await supabase.from("categories").delete().eq("user_id", user.id)
    await supabase.from("quick_timers").delete().eq("user_id", user.id)
    await supabase.from("schedule_blocks").delete().eq("user_id", user.id)
    await supabase.from("user_profiles").delete().eq("id", user.id)
    await supabase.auth.signOut()
    navigate("/login")
  }

  const sectionTitle: React.CSSProperties = { color: th.sub, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, marginTop: 24 }

  return (
    <Background settings={settings} style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ color: th.text, fontSize: 18, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8 }}>{t.account}</h1>

        {/* Plan badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 100, border: `1px solid ${th.border}`, marginBottom: 24 }}>
          <span style={{ color: isPremium ? "#6C63FF" : th.sub, fontSize: 13 }}>
            {isPremium ? "⭐ " + t.premium : t.standard}
          </span>
        </div>

        <p style={{ color: th.sub, fontSize: 14, marginBottom: 24 }}>{email}</p>

        {/* Sign out */}
        <div style={sectionTitle}>Session</div>
        <button onClick={handleSignOut} style={{ background: "none", border: `1px solid ${th.border}`, borderRadius: 100, padding: "12px 24px", color: th.sub, fontSize: 14, cursor: "pointer" }}>
          {t.signOut}
        </button>

        {/* Danger zone */}
        <div style={{ ...sectionTitle, color: "#FF6584", marginTop: 40 }}>{t.dangerZone}</div>
        <p style={{ color: th.muted, fontSize: 13, marginBottom: 12 }}>{t.deleteAccountNote}</p>
        <button onClick={handleDeleteAccount} style={{ background: "none", border: "1px solid #FF6584", borderRadius: 100, padding: "12px 24px", color: "#FF6584", fontSize: 14, cursor: "pointer" }}>
          {t.deleteAccount}
        </button>
      </div>
    </Background>
  )
}
