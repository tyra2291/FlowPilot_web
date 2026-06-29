import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "../lib/i18n"
import { useTheme } from "../hooks/useTheme"

const ITEMS = [
  { path: "/",             label: (t: any) => "FlowPilot", icon: "⏱" },
  { path: "/dashboard",   label: (t: any) => t.dashboard,   icon: "📊" },
  { path: "/history",     label: (t: any) => t.history,     icon: "📋" },
  { path: "/schedule",    label: (t: any) => t.schedule,    icon: "📅" },
  { path: "/categories",  label: (t: any) => t.categories,  icon: "🏷" },
  { path: "/quick-timers",label: (t: any) => t.quickTimers, icon: "⚡" },
  { path: "/settings",    label: (t: any) => t.settings,    icon: "⚙" },
  { path: "/help",        label: (t: any) => t.help,        icon: "?" },
]

export default function Nav() {
  const { t } = useTranslation()
  const { th } = useTheme()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const navItems = ITEMS.map((item) => {
    const active = location.pathname === item.path
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setOpen(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          textDecoration: "none",
          color: active ? th.text : th.sub,
          background: active ? "rgba(255,255,255,0.06)" : "transparent",
          borderRadius: 8,
          fontSize: 14,
          letterSpacing: item.path === "/" ? 3 : 1,
          textTransform: item.path === "/" ? "uppercase" : "none",
          fontWeight: item.path === "/" ? 500 : 400,
          transition: "background 0.15s",
        }}
      >
        <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
        {item.label(t)}
      </Link>
    )
  })

  return (
    <>
      {/* Desktop sidebar */}
      <nav style={{
        width: 220,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        padding: "24px 12px",
        gap: 4,
        borderRight: `1px solid ${th.border}`,
        overflowY: "auto",
      }} className="desktop-nav">
        {navItems}
      </nav>

      {/* Mobile burger button */}
      <button
        className="mobile-burger"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1000,
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: 5,
          padding: 8,
        }}
      >
        <div style={{ width: 24, height: 2, background: th.text, borderRadius: 2 }} />
        <div style={{ width: 24, height: 2, background: th.text, borderRadius: 2 }} />
        <div style={{ width: 24, height: 2, background: th.text, borderRadius: 2 }} />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.6)" }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 240,
              background: th.modalBg,
              padding: "24px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {navItems}
          </div>
        </div>
      )}
    </>
  )
}
