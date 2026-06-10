import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import { DEFAULT_SETTINGS } from "../hooks/useSettings"
import { MESH_PRESETS } from "../lib/backgroundPresets"
import Background from "../components/Background"

const PALETTE = [
  "#0F0F0F","#1A1A2E","#0D0D0D","#F5F5F5","#FAFAFA",
  "#6C63FF","#FF6584","#43B89C","#F9A825","#2196F3",
]

export default function Settings() {
  const { t } = useTranslation()
  const { settings, th, updateSettings } = useTheme()

  const toggle = (field: "notificationsEnabled" | "autoStartScheduled" | "interruptionEnabled") =>
    updateSettings({ [field]: !settings[field] })

  const sectionTitle: React.CSSProperties = { color: th.sub, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, marginTop: 24 }
  const row: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 10, background: th.card, marginBottom: 6 }
  const rowLabel: React.CSSProperties = { color: th.text, fontSize: 14 }
  const rowDesc: React.CSSProperties = { color: th.muted, fontSize: 12, marginTop: 2 }

  return (
    <Background settings={settings} style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ color: th.text, fontSize: 18, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8 }}>{t.settings}</h1>

        {/* Circle style */}
        <div style={sectionTitle}>{t.circleStyle}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["solid","gradient"] as const).map((s) => (
            <button key={s} onClick={() => updateSettings({ circleStyle: s })} style={pill(th, settings.circleStyle === s)}>
              {s === "solid" ? t.solid : t.gradient}
            </button>
          ))}
        </div>

        {/* Circle fixed color */}
        <div style={sectionTitle}>{t.colorLabel}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <div onClick={() => updateSettings({ circleFixedColor: null })} style={colorDot("#888", settings.circleFixedColor === null, true)} />
          {PALETTE.map((c) => (
            <div key={c} onClick={() => updateSettings({ circleFixedColor: c })} style={colorDot(c, settings.circleFixedColor === c, false)} />
          ))}
          <input type="color" value={settings.circleFixedColor ?? "#6C63FF"} onChange={(e) => updateSettings({ circleFixedColor: e.target.value })}
            style={{ width: 28, height: 28, borderRadius: 14, border: "none", cursor: "pointer", padding: 0 }} />
        </div>

        {/* Background type */}
        <div style={sectionTitle}>Background</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["solid","gradient","mesh"] as const).map((s) => (
            <button key={s} onClick={() => updateSettings({ backgroundType: s })} style={pill(th, settings.backgroundType === s)}>
              {s === "solid" ? t.backgroundSolid.replace("Background — ", "") : s === "gradient" ? t.backgroundGradient.replace("Background — ", "") : "Glow"}
            </button>
          ))}
        </div>

        {settings.backgroundType === "solid" && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {PALETTE.map((c) => (
              <div key={c} onClick={() => updateSettings({ backgroundColor: c })} style={colorDot(c, settings.backgroundColor === c, false)} />
            ))}
            <input type="color" value={settings.backgroundColor} onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
              style={{ width: 28, height: 28, borderRadius: 14, border: "none", cursor: "pointer", padding: 0 }} />
          </div>
        )}

        {settings.backgroundType === "mesh" && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {MESH_PRESETS.map((preset) => (
              <button
                key={preset.key}
                onClick={() => updateSettings({ backgroundMeshKey: preset.key })}
                style={{
                  ...pill(th, settings.backgroundMeshKey === preset.key),
                  background: settings.backgroundMeshKey === preset.key ? preset.base : "none",
                  border: `2px solid ${settings.backgroundMeshKey === preset.key ? preset.layers[0]?.colors[0] ?? th.border : th.border}`,
                }}
              >
                <span style={{ fontSize: 11 }}>{(t as any)[preset.key] || preset.key}</span>
              </button>
            ))}
          </div>
        )}

        {/* Behaviour */}
        <div style={sectionTitle}>{t.behaviour}</div>
        {([
          { key: "notificationsEnabled", label: t.notificationsLabel, desc: t.notificationsDesc },
          { key: "autoStartScheduled",   label: t.autoStartLabel,     desc: t.autoStartDesc },
          { key: "interruptionEnabled",  label: t.interruptionLabel,  desc: t.interruptionDesc },
        ] as const).map((item) => (
          <div key={item.key} style={row}>
            <div>
              <div style={rowLabel}>{item.label}</div>
              <div style={rowDesc}>{item.desc}</div>
            </div>
            <div
              onClick={() => toggle(item.key)}
              style={{
                width: 44, height: 24, borderRadius: 12, cursor: "pointer", flexShrink: 0,
                background: settings[item.key] ? "#6C63FF" : th.border, position: "relative", transition: "background 0.2s",
              }}
            >
              <div style={{
                position: "absolute", top: 3, left: settings[item.key] ? 22 : 3,
                width: 18, height: 18, borderRadius: 9, background: "#fff", transition: "left 0.2s",
              }} />
            </div>
          </div>
        ))}

        {/* Reset */}
        <button
          onClick={() => { if (confirm("Reset all settings to defaults?")) updateSettings(DEFAULT_SETTINGS) }}
          style={{ marginTop: 24, background: "none", border: `1px solid ${th.border}`, borderRadius: 100, padding: "12px 24px", color: th.sub, fontSize: 14, cursor: "pointer" }}
        >
          {t.resetToDefaults}
        </button>
      </div>
    </Background>
  )
}

const pill = (th: { text: string; border: string; inv: string }, active: boolean): React.CSSProperties => ({
  background: active ? th.text : "none", border: `1px solid ${th.border}`, borderRadius: 100,
  padding: "8px 16px", color: active ? th.inv : th.text, fontSize: 13, cursor: "pointer",
})

const colorDot = (c: string, active: boolean, isCat: boolean): React.CSSProperties => ({
  width: 28, height: 28, borderRadius: 14, background: isCat ? "transparent" : c,
  border: active ? "3px solid #fff" : `3px solid transparent`, cursor: "pointer", boxSizing: "border-box",
  fontSize: isCat ? 18 : undefined, textAlign: "center", lineHeight: "22px",
  display: isCat ? "flex" : undefined, alignItems: isCat ? "center" : undefined, justifyContent: isCat ? "center" : undefined,
})
