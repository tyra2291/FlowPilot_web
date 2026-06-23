import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { supabase } from "./lib/supabase"
import { useTheme } from "./hooks/useTheme"
import { useSubscription } from "./hooks/useSubscription"
import Nav from "./components/Nav"
import Login from "./pages/Login"
import Timer from "./pages/Timer"
import History from "./pages/History"
import Categories from "./pages/Categories"
import QuickTimers from "./pages/QuickTimers"
import Schedule from "./pages/Schedule"
import Settings from "./pages/Settings"
import Dashboard from "./pages/Dashboard"
import Upgrade from "./pages/Upgrade"
import Account from "./pages/Account"
import SessionEdit from "./pages/SessionEdit"
import Help from "./pages/Help"
import Confirmed from "./pages/Confirmed"

const isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

function MobileRedirect() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#080510",
      backgroundImage: "linear-gradient(180deg, rgba(170,50,255,0.4), transparent), linear-gradient(315deg, rgba(255,50,120,0.25), transparent)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>📱</div>
        <h1 style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>FlowPilot</h1>
        <p style={{ color: "#AAAAAA", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          The web app is designed for desktop.<br />Use the native app on your phone for the best experience.
        </p>
        <a
          href="https://play.google.com/store/apps/details?id=app.flowpilot.focus"
          style={{
            display: "inline-block",
            background: "#AA32FF",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 100,
            padding: "14px 32px",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: 1,
          }}
        >
          Available on Android
        </a>
      </div>
    </div>
  )
}

function AuthedApp() {
  const { th } = useTheme()
  const { isPremium, loading: premiumLoading } = useSubscription()
  const location = useLocation()
  const isLogin = location.pathname === "/login"

  if (premiumLoading) return null

  if (!isPremium) {
    return (
      <Routes>
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="*"        element={<Navigate to="/upgrade" replace />} />
      </Routes>
    )
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: th.modalBg }}>
      {!isLogin && <Nav />}
      <main style={{ flex: 1, overflowY: "auto" }}>
        <Routes>
          <Route path="/"             element={<Timer />} />
          <Route path="/history"      element={<History />} />
          <Route path="/categories"   element={<Categories />} />
          <Route path="/quick-timers" element={<QuickTimers />} />
          <Route path="/schedule"     element={<Schedule />} />
          <Route path="/settings"     element={<Settings />} />
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/upgrade"      element={<Upgrade />} />
          <Route path="/account"      element={<Account />} />
          <Route path="/help"         element={<Help />} />
          <Route path="/session/:id"  element={<SessionEdit />} />
          <Route path="/confirmed"    element={<Confirmed />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function GuestApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*"      element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (isMobileBrowser) return <MobileRedirect />

  if (authed === null) return null

  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH ?? "/"}>
      {authed ? <AuthedApp /> : <GuestApp />}
    </BrowserRouter>
  )
}
