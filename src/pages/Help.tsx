import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import Background from "../components/Background"

export default function Help() {
  const { t } = useTranslation()
  const { settings, th } = useTheme()

  const sections = [
    { title: "Timer",              desc: t.helpTimerDesc },
    { title: t.dashboard,         desc: t.helpDashboardDesc },
    { title: t.history,           desc: t.helpHistoryDesc },
    { title: t.schedule,          desc: t.helpScheduleDesc },
    { title: t.categories,        desc: t.helpCategoriesDesc },
    { title: t.quickTimers,       desc: t.helpQuickTimersDesc },
    { title: t.settings,          desc: t.helpSettingsDesc },
    { title: t.account,           desc: t.helpAccountDesc },
  ]

  return (
    <Background settings={settings} style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ color: th.text, fontSize: 18, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", marginBottom: 24 }}>{t.help}</h1>
        {sections.map((s) => (
          <div key={s.title} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${th.border}` }}>
            <h2 style={{ color: th.text, fontSize: 15, fontWeight: 500, marginBottom: 8 }}>{s.title}</h2>
            <p style={{ color: th.sub, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
          </div>
        ))}
        <p style={{ color: th.muted, fontSize: 13, textAlign: "center" }}>
          {t.appVersion} {import.meta.env.VITE_APP_VERSION ?? "1.0.0"} · <a href="mailto:supportflowpilot@gmail.com" style={{ color: th.muted }}>supportflowpilot@gmail.com</a>
        </p>
      </div>
    </Background>
  )
}
