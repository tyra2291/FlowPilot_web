export interface MeshLayer {
  colors: [string, string]
  start: { x: number; y: number }
  end:   { x: number; y: number }
}

export interface MeshPreset {
  key: MeshKey
  base: string
  layers: MeshLayer[]
}

export type MeshKey =
  | "meshVoid"
  | "meshAurora"
  | "meshNebula"
  | "meshCosmos"
  | "meshDusk"
  | "meshCrimson"
  | "meshBloom"
  | "meshPolar"
  | "meshGalaxy"

export const MESH_PRESETS: MeshPreset[] = [
  {
    key: "meshVoid",
    base: "#07070D",
    layers: [
      { colors: ["rgba(108,99,255,0.5)", "transparent"], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    ],
  },
  {
    key: "meshAurora",
    base: "#04040F",
    layers: [
      { colors: ["rgba(0,180,255,0.35)", "transparent"], start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
      { colors: ["rgba(80,50,220,0.35)", "transparent"], start: { x: 0, y: 0 }, end: { x: 1, y: 0.7 } },
    ],
  },
  {
    key: "meshNebula",
    base: "#080510",
    layers: [
      { colors: ["rgba(170,50,255,0.4)", "transparent"],  start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
      { colors: ["rgba(255,50,120,0.25)", "transparent"], start: { x: 1,   y: 1 }, end: { x: 0,   y: 0 } },
    ],
  },
  {
    key: "meshCosmos",
    base: "#04040A",
    layers: [
      { colors: ["rgba(50,100,255,0.4)", "transparent"],   start: { x: 0.5, y: 0 },   end: { x: 0.5, y: 0.9 } },
      { colors: ["transparent", "rgba(200,140,50,0.18)"],  start: { x: 0,   y: 0.5 }, end: { x: 1,   y: 1   } },
    ],
  },
  {
    key: "meshDusk",
    base: "#030A05",
    layers: [
      { colors: ["rgba(40,200,90,0.35)",  "transparent"], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      { colors: ["rgba(0,160,160,0.25)",  "transparent"], start: { x: 1, y: 1 }, end: { x: 0, y: 0.5 } },
    ],
  },
  {
    key: "meshCrimson",
    base: "#0A0303",
    layers: [
      { colors: ["rgba(210,40,40,0.45)", "transparent"], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    ],
  },
  {
    key: "meshGalaxy",
    base: "#030412",
    layers: [
      { colors: ["rgba(20,80,255,0.65)",   "transparent"], start: { x: 0.5, y: 0   }, end: { x: 0.5, y: 1   } },
      { colors: ["rgba(0,160,255,0.30)",   "transparent"], start: { x: 1,   y: 0   }, end: { x: 0,   y: 0.8 } },
      { colors: ["rgba(120,40,240,0.38)",  "transparent"], start: { x: 0,   y: 1   }, end: { x: 1,   y: 0   } },
    ],
  },
  {
    key: "meshBloom",
    base: "#1A0815",
    layers: [
      { colors: ["rgba(255,120,200,0.72)",  "transparent"], start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
      { colors: ["rgba(255,40,160,0.45)",   "transparent"], start: { x: 1,   y: 0 }, end: { x: 0,   y: 1 } },
    ],
  },
  {
    key: "meshPolar",
    base: "#050D18",
    layers: [
      { colors: ["rgba(60,160,255,0.50)",  "transparent"], start: { x: 0,   y: 0 }, end: { x: 1, y: 1 } },
      { colors: ["rgba(20,210,220,0.28)",  "transparent"], start: { x: 1,   y: 0 }, end: { x: 0, y: 1 } },
    ],
  },
]
