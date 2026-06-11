import { useNavigate } from "react-router-dom"
import { useTheme } from "../hooks/useTheme"
import Background from "../components/Background"

export default function Confirmed() {
  const { settings, th } = useTheme()
  const navigate = useNavigate()

  return (
    <Background settings={settings} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ maxWidth: 360, width: "100%", padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 24 }}>✓</div>
        <h2 style={{ color: th.text, fontSize: 22, fontWeight: 300, letterSpacing: 2, marginBottom: 12 }}>
          Email confirmed
        </h2>
        <p style={{ color: th.sub, fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Your account is ready. You can now sign in.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            background: th.text, border: "none", borderRadius: 100,
            padding: "14px 32px", color: th.inv, fontSize: 15,
            cursor: "pointer", fontWeight: 500, letterSpacing: 1,
          }}
        >
          Open FlowPilot
        </button>
      </div>
    </Background>
  )
}
