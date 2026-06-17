import { useState, useEffect, useRef } from "react"

const SW_KEY = "fp-sw"

type PersistedSW =
  | { isRunning: true;  startTimestamp: number }
  | { isRunning: false; elapsed: number }

function readSW(): PersistedSW | null {
  try {
    const raw = sessionStorage.getItem(SW_KEY)
    return raw ? (JSON.parse(raw) as PersistedSW) : null
  } catch {
    return null
  }
}

export function useStopwatch() {
  // Read persisted state once on mount (ref ensures single read across renders).
  const saved = useRef(readSW()).current

  const [elapsed, setElapsed] = useState(() => {
    if (!saved) return 0
    if (saved.isRunning) return Math.max(0, Math.floor((Date.now() - saved.startTimestamp) / 1000))
    return saved.elapsed
  })
  const [isRunning, setIsRunning] = useState(() => saved?.isRunning ?? false)

  const startTimeRef  = useRef<number | null>(
    saved?.isRunning ? saved.startTimestamp : null
  )
  const isRunningRef  = useRef(isRunning)
  isRunningRef.current = isRunning

  // Tick interval.
  useEffect(() => {
    if (!isRunning) {
      startTimeRef.current = null
      return
    }
    startTimeRef.current = Date.now() - elapsed * 1000
    const interval = setInterval(() => {
      if (startTimeRef.current === null) return
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 500)
    return () => clearInterval(interval)
  }, [isRunning]) // eslint-disable-line react-hooks/exhaustive-deps

  // Correct elapsed when tab regains focus.
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState !== "visible") return
      if (!isRunningRef.current || startTimeRef.current === null) return
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }
    document.addEventListener("visibilitychange", handler)
    return () => document.removeEventListener("visibilitychange", handler)
  }, [])

  // Persist to sessionStorage whenever running state changes.
  useEffect(() => {
    if (isRunning) {
      const startTimestamp = Date.now() - elapsed * 1000
      sessionStorage.setItem(SW_KEY, JSON.stringify({ isRunning: true, startTimestamp }))
    } else if (elapsed > 0) {
      sessionStorage.setItem(SW_KEY, JSON.stringify({ isRunning: false, elapsed }))
    } else {
      sessionStorage.removeItem(SW_KEY)
    }
  }, [isRunning]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => setIsRunning((r) => !r)

  const reset = () => {
    setElapsed(0)
    setIsRunning(false)
    startTimeRef.current = null
    sessionStorage.removeItem(SW_KEY)
  }

  const swLapNumber  = Math.floor(elapsed / 60)
  const swLapElapsed = elapsed % 60
  const phase        = (swLapNumber % 2 === 0 ? "fill" : "erase") as "fill" | "erase"
  const phaseProgress = swLapElapsed / 60
  const progress      = phase === "fill" ? 1 - phaseProgress : phaseProgress

  return { elapsed, isRunning, toggle, reset, progress, phase, phaseProgress }
}
