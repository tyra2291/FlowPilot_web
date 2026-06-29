import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom"
import { supabase } from "./lib/supabase"
import { useTheme } from "./hooks/useTheme"
import { FocusModeProvider, useFocusMode } from "./contexts/FocusMode"
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
  const location = useLocation()
  const { focusMode } = useFocusMode()
  const isLogin = location.pathname === "/login"

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: th.modalBg }}>
      {!isLogin && !focusMode && <Nav />}
      {!isLogin && !focusMode && createPortal(
        <Link
          to="/account"
          style={{
            position: "fixed", top: 16, right: 20, zIndex: 9999,
            color: th.text, textDecoration: "none", lineHeight: 1,
            opacity: 0.75, display: "block",
          }}
          title="Account"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.66 0 4.8-2.14 4.8-4.8S14.66 2.4 12 2.4 7.2 4.54 7.2 7.2 9.34 12 12 12zm0 2.4c-3.2 0-9.6 1.61-9.6 4.8v2.4h19.2v-2.4c0-3.19-6.4-4.8-9.6-4.8z"/>
          </svg>
        </Link>,
        document.body
      )}
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
    <FocusModeProvider>
      <BrowserRouter basename={import.meta.env.VITE_BASE_PATH ?? "/"}>
        {authed ? <AuthedApp /> : <GuestApp />}
      </BrowserRouter>
    </FocusModeProvider>
  )
}
