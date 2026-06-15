import { useState } from "react"

interface Props {
  progress: number
  seconds: number
  color: string
  accentColor?: string
  size?: number
  onReset?: () => void
  onAddTime?: (seconds: number) => void
  onInterrupt?: () => void
  interruptionActive?: boolean
  interruptionElapsed?: number
  useGradient?: boolean
  textColor?: string
  trackColor?: string
  lapPhase?: "fill" | "erase"
  lapPhaseProgress?: number
}

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

export default function CircularTimer({
  progress,
  seconds,
  color,
  accentColor,
  size = 280,
  onReset,
  onAddTime,
  onInterrupt,
  interruptionActive = false,
  interruptionElapsed = 0,
  useGradient = false,
  textColor = "#FFFFFF",
  trackColor = "#1A1A1A",
  lapPhase,
  lapPhaseProgress,
}: Props) {
  const [addExpanded, setAddExpanded] = useState(false)
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * progress

  return (
    <div
      style={{ position: "relative", width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      onClick={() => { if (addExpanded) setAddExpanded(false) }}
    >
      <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <linearGradient id="circleGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="1" stopColor={accentColor || color} stopOpacity="1" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        {/* Main arc: fill/erase phases both move clockwise when lapPhase is set */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={useGradient ? "url(#circleGradient)" : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={
            lapPhase !== undefined && lapPhaseProgress !== undefined
              ? (lapPhase === "fill"
                ? circumference * (1 - lapPhaseProgress)
                : circumference * lapPhaseProgress)
              : offset
          }
          strokeLinecap="round"
          transform={`rotate(${
            lapPhase === "erase" && lapPhaseProgress !== undefined
              ? -90 + lapPhaseProgress * 360
              : -90
          } ${size / 2} ${size / 2})`}
          style={{ transition: lapPhase !== undefined ? "none" : "stroke-dashoffset 0.5s linear" }}
        />
      </svg>

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: size * 0.22, color: textColor, fontWeight: 200, letterSpacing: 4, fontVariantNumeric: "tabular-nums" }}>
          {fmt(seconds)}
        </span>

        {(onReset || onAddTime) && !interruptionActive && (
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
            {onReset && (
              <button onClick={(e) => { e.stopPropagation(); onReset() }} style={btnStyle}>
                <span style={{ color: "#888", fontSize: 22 }}>↺</span>
              </button>
            )}
            {onAddTime && !addExpanded && (
              <button onClick={(e) => { e.stopPropagation(); setAddExpanded(true) }} style={pillStyle}>
                <span style={{ color: "#888", fontSize: 16, lineHeight: 1 }}>+</span>
              </button>
            )}
            {onAddTime && addExpanded && [5, 10, 15].map((m) => (
              <button key={m} onClick={(e) => { e.stopPropagation(); onAddTime(m * 60); setAddExpanded(false) }} style={pillStyle}>
                <span style={{ color: "#888", fontSize: 12 }}>+{m}m</span>
              </button>
            ))}
          </div>
        )}

        {onInterrupt && (
          <button
            onClick={(e) => { e.stopPropagation(); onInterrupt() }}
            style={interruptionActive ? interruptActiveStyle : pillStyle}
          >
            {interruptionActive
              ? <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>⚡ {fmt(interruptionElapsed)}</span>
              : <span style={{ color: "#888", fontSize: 14 }}>⚡</span>
            }
          </button>
        )}
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", alignItems: "center", justifyContent: "center",
}
const pillStyle: React.CSSProperties = {
  background: "none", border: "1px solid #888", borderRadius: 100, cursor: "pointer",
  padding: "4px 8px", display: "flex", alignItems: "center", justifyContent: "center",
}
const interruptActiveStyle: React.CSSProperties = {
  background: "#FF6584", border: "none", borderRadius: 100, cursor: "pointer",
  padding: "5px 10px", display: "flex", alignItems: "center", justifyContent: "center",
}
