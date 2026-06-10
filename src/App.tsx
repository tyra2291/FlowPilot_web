import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { supabase } from "./lib/supabase"
import { useTheme } from "./hooks/useTheme"
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

function AuthedApp() {
  const { th } = useTheme()
  const location = useLocation()
  const isLogin = location.pathname === "/login"

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

  if (authed === null) return null

  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH ?? "/"}>
      {authed ? <AuthedApp /> : <GuestApp />}
    </BrowserRouter>
  )
}
