import { useSettings } from "./useSettings"
import { isLightBackground } from "../lib/colorUtils"

export function useTheme() {
  const { settings, loading, loadSettings, updateSettings } = useSettings()

  const isLight = isLightBackground(settings)
  const isMesh = settings.backgroundType === "mesh"

  const th = {
    text:    isLight ? "#111111" : "#FFFFFF",
    sub:     isLight ? "#555555" : isMesh ? "#FFFFFF" : "#666666",
    muted:   isLight ? "#777777" : isMesh ? "#CCCCCC" : "#444444",
    border:  isLight ? "#CCCCCC" : isMesh ? "#555555" : "#333333",
    inv:     isLight ? "#FFFFFF" : "#0F0F0F",
    track:   isLight ? "rgba(0,0,0,0.08)" : isMesh ? "rgba(255,255,255,0.10)" : "#1A1A1A",
    card:    isLight ? "rgba(0,0,0,0.08)" : isMesh ? "rgba(255,255,255,0.08)" : "#1A1A1A",
    modalBg: isLight ? "#F0F0F5" : "#1C1C2E",
  }

  return { settings, loading, loadSettings, updateSettings, isLight, th }
}
