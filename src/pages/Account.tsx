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

  const [email, setEmail]       = useState("")
  const [displayName, setDisplayName] = useState("")
  const [nameSaved, setNameSaved] = useState(false)
  const [newPwd, setNewPwd]     = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [pwdMsg, setPwdMsg]     = useState("")
  const [isGoogle, setIsGoogle] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      if (!user) return
      setEmail(user.email ?? "")
      setDisplayName(user.user_metadata?.full_name ?? "")
      const identities = user.identities ?? []
      setIsGoogle(identities.some((id) => id.provider === "google"))
    })
  }, [])

  const handleSaveName = async () => {
    const { error } = await supabase.auth.updateUser({ data: { full_name: displayName } })
    if (!error) setNameSaved(true)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPwdMsg("")
    if (newPwd !== confirmPwd) { setPwdMsg(t.passwordsNoMatch); return }
    if (newPwd.length < 6) { setPwdMsg(t.passwordTooShort); return }
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    if (error) setPwdMsg(error.message)
    else { setPwdMsg(t.passwordUpdated); setNewPwd(""); setConfirmPwd("") }
  }

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

  const input: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10, border: `1px solid ${th.border}`,
    background: "transparent", color: th.text, fontSize: 15, outline: "none", boxSizing: "border-box",
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

        {/* Display name */}
        <div style={sectionTitle}>{t.accountInfo}</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input value={displayName} onChange={(e) => { setDisplayName(e.target.value); setNameSaved(false) }} placeholder={t.displayName} style={{ ...input, flex: 1 }} />
          <button onClick={handleSaveName} style={{ background: th.text, border: "none", borderRadius: 100, padding: "12px 20px", color: th.inv, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>
            {nameSaved ? t.nameSaved : t.saveChanges}
          </button>
        </div>

        {/* Password */}
        <div style={sectionTitle}>{t.security}</div>
        {isGoogle ? (
          <p style={{ color: th.muted, fontSize: 13 }}>{t.googlePasswordNote}</p>
        ) : (
          <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder={t.newPassword} style={input} />
            <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder={t.confirmPassword} style={input} />
            {pwdMsg && <p style={{ color: pwdMsg === t.passwordUpdated ? "#43B89C" : "#FF6584", fontSize: 13, margin: 0 }}>{pwdMsg}</p>}
            <button type="submit" style={{ background: th.text, border: "none", borderRadius: 100, padding: "12px 24px", color: th.inv, fontSize: 14, cursor: "pointer", alignSelf: "flex-start" }}>
              {t.updatePassword}
            </button>
          </form>
        )}

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
