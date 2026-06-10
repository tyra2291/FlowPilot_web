export function isLightHex(hex: string): boolean {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
}

export function isLightBackground(settings: {
  backgroundType: string
  backgroundColor: string
  backgroundGradient: string[]
}): boolean {
  if (settings.backgroundType === "mesh") return false
  const hex =
    settings.backgroundType === "gradient"
      ? settings.backgroundGradient[0]
      : settings.backgroundColor
  return isLightHex(hex)
}
