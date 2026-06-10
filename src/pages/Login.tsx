import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useTranslation } from "../lib/i18n"
import { useTheme } from "../hooks/useTheme"
import Background from "../components/Background"

export default function Login() {
  const { t } = useTranslation()
  const { settings, th } = useTheme()
  const navigate = useNavigate()

  const [mode, setMode]         = useState<"signin" | "signup">("signin")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [checkEmail, setCheckEmail] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setCheckEmail(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate("/")
      }
    } catch (e: any) {
      setError(e.message ?? t.errorLabel)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + (import.meta.env.VITE_BASE_PATH ?? "/") },
    })
    if (error) setError(error.message)
  }

  const label: React.CSSProperties = { fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: th.sub, marginBottom: 6 }
  const input: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: 10, border: `1px solid ${th.border}`,
    background: "transparent", color: th.text, fontSize: 16, outline: "none", boxSizing: "border-box",
  }

  if (checkEmail) {
    return (
      <Background settings={settings} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ maxWidth: 360, width: "100%", padding: 32, textAlign: "center" }}>
          <h2 style={{ color: th.text, fontSize: 22, fontWeight: 300, marginBottom: 16 }}>{t.checkEmail}</h2>
          <p style={{ color: th.sub }}>{t.checkEmailMsg}</p>
          <button onClick={() => setCheckEmail(false)} style={{ ...btnOutline(th), marginTop: 24 }}>{t.back}</button>
        </div>
      </Background>
    )
  }

  return (
    <Background settings={settings} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ maxWidth: 380, width: "100%", padding: "32px 24px" }}>
        <h1 style={{ color: th.text, fontSize: 22, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", marginBottom: 32 }}>FlowPilot</h1>

        <button onClick={handleGoogle} style={{ ...btnOutline(th), width: "100%", marginBottom: 16 }}>
          {t.continueWithGoogle}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: th.border }} />
          <span style={{ color: th.muted, fontSize: 13 }}>{t.orSeparator}</span>
          <div style={{ flex: 1, height: 1, background: th.border }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={label}>{t.emailPlaceholder}</div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} autoComplete="email" required />
          </div>
          <div>
            <div style={label}>{t.passwordPlaceholder}</div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} autoComplete={mode === "signup" ? "new-password" : "current-password"} required />
          </div>

          {error && <p style={{ color: "#FF6584", fontSize: 13, margin: 0 }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ ...btnPrimary(th), width: "100%", opacity: loading ? 0.6 : 1 }}>
            {loading ? t.loading : (mode === "signin" ? t.signIn : t.createAccount)}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          style={{ background: "none", border: "none", cursor: "pointer", color: th.sub, fontSize: 13, marginTop: 16, padding: 0 }}
        >
          {mode === "signin" ? t.noAccount : t.alreadyHaveAccount}
        </button>
      </div>
    </Background>
  )
}

export const btnOutline = (th: { text: string; border: string; inv: string }) => ({
  background: "transparent",
  border: `1px solid ${th.border}`,
  borderRadius: 100,
  padding: "14px 24px",
  color: th.text,
  fontSize: 15,
  cursor: "pointer",
  letterSpacing: 1,
} as React.CSSProperties)

export const btnPrimary = (th: { text: string; border: string; inv: string }) => ({
  background: th.text,
  border: "none",
  borderRadius: 100,
  padding: "14px 24px",
  color: th.inv,
  fontSize: 15,
  cursor: "pointer",
  fontWeight: 500,
  letterSpacing: 1,
} as React.CSSProperties)
