import { useState, useEffect, useRef } from "react"

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const startTimeRef = useRef<number | null>(null)
  const isRunningRef = useRef(isRunning)
  isRunningRef.current = isRunning

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

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState !== "visible") return
      if (!isRunningRef.current || startTimeRef.current === null) return
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }
    document.addEventListener("visibilitychange", handler)
    return () => document.removeEventListener("visibilitychange", handler)
  }, [])

  const toggle = () => setIsRunning((r) => !r)

  const reset = () => {
    setElapsed(0)
    setIsRunning(false)
    startTimeRef.current = null
  }

  const swLapNumber = Math.floor(elapsed / 60)
  const swLapElapsed = elapsed % 60
  const phase = (swLapNumber % 2 === 0 ? "fill" : "erase") as "fill" | "erase"
  const phaseProgress = swLapElapsed / 60
  const progress = phase === "fill" ? 1 - phaseProgress : phaseProgress

  return { elapsed, isRunning, toggle, reset, progress, phase, phaseProgress }
}
