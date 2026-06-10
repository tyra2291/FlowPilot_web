import { useState, useEffect, useRef } from "react"

export function useTimer(initialDuration: number) {
  const [seconds, setSeconds]               = useState(initialDuration)
  const [chosenDuration, setChosenDuration] = useState(initialDuration)
  const [isRunning, setIsRunning]           = useState(false)
  const [originalDuration, setOriginalDuration] = useState(initialDuration)

  const endTimeRef   = useRef<number | null>(null)
  const secondsRef   = useRef(seconds)
  const isRunningRef = useRef(isRunning)
  secondsRef.current   = seconds
  isRunningRef.current = isRunning

  // Timestamp-based countdown — immune to tab throttling.
  useEffect(() => {
    if (!isRunning) {
      endTimeRef.current = null
      return
    }
    endTimeRef.current = Date.now() + secondsRef.current * 1000

    const interval = setInterval(() => {
      if (endTimeRef.current === null) return
      const remaining = Math.round((endTimeRef.current - Date.now()) / 1000)
      if (remaining <= 0) {
        setIsRunning(false)
        setSeconds(0)
        endTimeRef.current = null
      } else {
        setSeconds(remaining)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isRunning])

  // Instant correction when the tab becomes visible again (replaces AppState).
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState !== "visible") return
      if (!isRunningRef.current || endTimeRef.current === null) return
      const remaining = Math.round((endTimeRef.current - Date.now()) / 1000)
      if (remaining <= 0) {
        setIsRunning(false)
        setSeconds(0)
        endTimeRef.current = null
      } else {
        setSeconds(remaining)
      }
    }
    document.addEventListener("visibilitychange", handler)
    return () => document.removeEventListener("visibilitychange", handler)
  }, [])

  const selectDuration = (s: number) => {
    setChosenDuration(s)
    setOriginalDuration(s)
    setSeconds(s)
    setIsRunning(false)
  }

  const reset = () => {
    setSeconds(originalDuration)
    setChosenDuration(originalDuration)
    setIsRunning(false)
  }

  const addTime = (secondsToAdd: number) => {
    setSeconds((s) => s + secondsToAdd)
    setChosenDuration((d) => d + secondsToAdd)
    if (endTimeRef.current !== null) {
      endTimeRef.current += secondsToAdd * 1000
    }
  }

  const toggle = () => setIsRunning((r) => !r)

  const jumpTo = (s: number) => {
    setSeconds(s)
    if (endTimeRef.current !== null) {
      endTimeRef.current = Date.now() + s * 1000
    }
  }

  const progress = chosenDuration > 0 ? 1 - seconds / chosenDuration : 0
  const elapsed  = chosenDuration - seconds

  return { seconds, chosenDuration, isRunning, progress, selectDuration, reset, toggle, elapsed, addTime, jumpTo }
}
