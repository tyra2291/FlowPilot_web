import { useState, useEffect } from "react"

export type CircleStyle = "solid" | "gradient"
export type BackgroundType = "solid" | "gradient" | "mesh"

export interface Settings {
  circleStyle: CircleStyle
  backgroundColor: string
  backgroundType: BackgroundType
  backgroundGradient: string[]
  backgroundMeshKey: string
  circleFixedColor: string | null
  notificationsEnabled: boolean
  autoStartScheduled: boolean
  interruptionEnabled: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  circleStyle: "solid",
  backgroundColor: "#0F0F0F",
  backgroundType: "mesh",
  backgroundGradient: ["#0F0F0F", "#1A1A2E"],
  backgroundMeshKey: "meshNebula",
  circleFixedColor: null,
  notificationsEnabled: false,
  autoStartScheduled: false,
  interruptionEnabled: false,
}

const STORAGE_KEY = "flowpilot_settings"

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(data) })
    } catch (e) {
      console.error("Failed to load settings", e)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (updates: Partial<Settings>) => {
    const updated = { ...settings, ...updates }
    setSettings(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error("Failed to save settings", e)
    }
  }

  return { settings, loading, updateSettings, loadSettings }
}
