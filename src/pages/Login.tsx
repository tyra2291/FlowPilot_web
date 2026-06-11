import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useTranslation } from "../lib/i18n"
import { useTheme } from "../hooks/useTheme"
import Background from "../components/Background"

export default function Login() {
  const { t } = useTranslation()
  const { settings, th } = useTheme()
  const [error, setError] = useState("")

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + (import.meta.env.VITE_BASE_PATH ?? "/") },
    })
    if (error) setError(error.message)
  }

  return (
    <Background settings={settings} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ maxWidth: 380, width: "100%", padding: "32px 24px" }}>
        <h1 style={{ color: th.text, fontSize: 22, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", marginBottom: 32 }}>FlowPilot</h1>

        <button onClick={handleGoogle} style={{ ...btnOutline(th), width: "100%" }}>
          {t.continueWithGoogle}
        </button>

        {error && <p style={{ color: "#FF6584", fontSize: 13, marginTop: 12 }}>{error}</p>}

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <a
            href="https://tyra2291.github.io/FlowPilot_landing_page/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: th.muted, fontSize: 12, textDecoration: "none" }}
          >
            {t.privacyPolicy}
          </a>
        </div>
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
