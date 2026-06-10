import { ReactNode, CSSProperties } from "react"
import { Settings } from "../hooks/useSettings"
import { MESH_PRESETS } from "../lib/backgroundPresets"

interface Props {
  settings: Settings
  children: ReactNode
  style?: CSSProperties
  className?: string
}

function buildBackground(settings: Settings): CSSProperties {
  if (settings.backgroundType === "solid") {
    return { backgroundColor: settings.backgroundColor }
  }
  if (settings.backgroundType === "gradient") {
    const [c1, c2] = settings.backgroundGradient
    return { background: `linear-gradient(135deg, ${c1}, ${c2})` }
  }
  // mesh
  const preset = MESH_PRESETS.find((p) => p.key === settings.backgroundMeshKey) ?? MESH_PRESETS[2]
  const gradients = preset.layers.map((layer) => {
    const x1 = layer.start.x * 100
    const y1 = layer.start.y * 100
    const x2 = layer.end.x * 100
    const y2 = layer.end.y * 100
    return `linear-gradient(${Math.round(Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI + 90)}deg, ${layer.colors[0]}, ${layer.colors[1]})`
  })
  return {
    backgroundColor: preset.base,
    backgroundImage: gradients.join(", "),
  }
}

export default function Background({ settings, children, style, className }: Props) {
  const bg = buildBackground(settings)
  return (
    <div
      className={className}
      style={{
        minHeight: "100%",
        width: "100%",
        ...bg,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
