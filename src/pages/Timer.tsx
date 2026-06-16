import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useTimer } from "../hooks/useTimer"
import { useStopwatch } from "../hooks/useStopwatch"
import { useCategories, Category } from "../hooks/useCategories"
import { useQuickTimers } from "../hooks/useQuickTimers"
import { useSessions } from "../hooks/useSessions"
import { useSchedule, ScheduleBlock } from "../hooks/useSchedule"
import { useSubscription } from "../hooks/useSubscription"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import Background from "../components/Background"
import CircularTimer from "../components/CircularTimer"
import { useTimerSync, RemoteTimerState } from "../hooks/useTimerSync"

const fmtDuration = (s: number) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

const MAX_VISIBLE = 5

export default function Timer() {
  const { t } = useTranslation()
  const { settings, th } = useTheme()
  const navigate = useNavigate()

  const { seconds, chosenDuration, isRunning, progress, selectDuration, reset, toggle, addTime, jumpTo, setRunning } = useTimer(25 * 60)
  const sw = useStopwatch()
  const { categories } = useCategories()
  const { quickTimers } = useQuickTimers()
  const { addSession, pruneOldSessions } = useSessions()
  const { isPremium, loading: subLoading } = useSubscription()
  const { blocks: scheduleBlocks } = useSchedule()

  const [mode, setMode] = useState<"timer" | "stopwatch">("timer")
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [sessionTitle, setSessionTitle] = useState("")
  const [focusMode, setFocusMode] = useState(false)
  const [catsExpanded, setCatsExpanded] = useState(false)
  const [timersExpanded, setTimersExpanded] = useState(false)
  const [currentBlock, setCurrentBlock] = useState<ScheduleBlock | null>(null)
  const [nextBlock, setNextBlock] = useState<ScheduleBlock | null>(null)
  const [interruptionActive, setInterruptionActive] = useState(false)
  const [interruptionElapsed, setInterruptionElapsed] = useState(0)
  const [confirmQuick, setConfirmQuick] = useState<{ durationSec: number; label: string } | null>(null)
  const [confirmSwitchSW, setConfirmSwitchSW] = useState(false)
  const savedSecondsRef = useRef(0)
  const wasRunningRef = useRef(false)
  const isRunningRef = useRef(isRunning)
  const currentBlockRef = useRef<ScheduleBlock | null>(null)
  const nextBlockRef = useRef<ScheduleBlock | null>(null)
  const fullDurationRef = useRef<number | null>(null)
  const restoreCategoryRef = useRef<string | null>(null)
  const restoredRef = useRef(false)
  const prevBlockIdRef = useRef<string | undefined>(undefined)
  const swIsRunningRef = useRef(sw.isRunning)
  const swElapsedRef   = useRef(sw.elapsed)
  const modeRef        = useRef(mode)
  isRunningRef.current    = isRunning
  swIsRunningRef.current  = sw.isRunning
  swElapsedRef.current    = sw.elapsed
  modeRef.current         = mode
  currentBlockRef.current = currentBlock
  nextBlockRef.current    = nextBlock

  // ── Realtime sync ────────────────────────────────────────────────────────
  const handleRemoteUpdate = useCallback((state: RemoteTimerState) => {
    const cat = categories.find((c) => c.name === state.category_name)
    if (cat) setActiveCategory(cat)
    setSessionTitle(state.title || "")
    if (state.is_running && state.end_time_ms) {
      const rem = Math.max(1, Math.round((state.end_time_ms - Date.now()) / 1000))
      jumpTo(rem)
      if (!isRunningRef.current) setRunning(true)
    } else {
      jumpTo(state.seconds_remaining)
      if (isRunningRef.current) setRunning(false)
    }
  }, [categories, jumpTo, setRunning])

  const { push: syncPush } = useTimerSync(handleRemoteUpdate)

  // Auto-push when timer starts or pauses — skips the first mount.
  const syncMountedRef = useRef(false)
  useEffect(() => {
    if (!syncMountedRef.current) { syncMountedRef.current = true; return }
    if (!activeCategory) return
    syncPush({
      is_running: isRunning,
      end_time_ms: isRunning ? Date.now() + seconds * 1000 : null,
      seconds_remaining: seconds,
      category_name: activeCategory.name,
      category_color: activeCategory.color,
      title: sessionTitle || null,
    })
  }, [isRunning])

  useEffect(() => {
    if (!subLoading && !isPremium) pruneOldSessions()
  }, [subLoading])

  // Persist running timer to sessionStorage so navigation between tabs doesn't lose it.
  useEffect(() => {
    if (isRunning && activeCategory) {
      sessionStorage.setItem("fp_timer", JSON.stringify({
        endTimeMs: Date.now() + seconds * 1000,
        chosenDuration,
        categoryId: activeCategory.id,
        title: sessionTitle,
      }))
    } else {
      sessionStorage.removeItem("fp_timer")
    }
  }, [isRunning])

  // Restore running timer state on mount (handles tab/page navigation).
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    const raw = sessionStorage.getItem("fp_timer")
    if (!raw) return
    try {
      const { endTimeMs, chosenDuration: dur, categoryId, title } = JSON.parse(raw)
      const rem = Math.round((endTimeMs - Date.now()) / 1000)
      if (rem > 0) {
        selectDuration(dur)
        jumpTo(rem)
        setRunning(true)
        if (title) setSessionTitle(title)
        if (categoryId) restoreCategoryRef.current = categoryId
      } else {
        sessionStorage.removeItem("fp_timer")
      }
    } catch { sessionStorage.removeItem("fp_timer") }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Restore category once the categories list is available.
  useEffect(() => {
    if (!restoreCategoryRef.current || categories.length === 0) return
    const cat = categories.find((c) => c.id === restoreCategoryRef.current)
    if (cat) setActiveCategory(cat)
    restoreCategoryRef.current = null
  }, [categories])

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) setActiveCategory(categories[0])
  }, [categories])

  // Auto-save on completion (timer mode only)
  useEffect(() => {
    if (mode === "stopwatch") return
    if (seconds === 0 && activeCategory) {
      const fullDur = fullDurationRef.current ?? chosenDuration
      fullDurationRef.current = null
      addSession({
        title: sessionTitle || null,
        category_name: activeCategory.name,
        category_color: activeCategory.color,
        duration_seconds: fullDur,
        elapsed_seconds: fullDur,
        completed: true,
      })
      setSessionTitle("")
      reset()
      setCurrentBlock(nextBlockRef.current)
      setNextBlock(null)
    }
  }, [seconds])

  // Schedule block detection
  useEffect(() => {
    const detect = () => {
      const now = new Date()
      const todayDow = now.getDay()
      const currentMin = now.getHours() * 60 + now.getMinutes()
      const sorted = scheduleBlocks
        .filter((b) => b.day_of_week === todayDow)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
      let current: ScheduleBlock | null = null
      let next: ScheduleBlock | null = null
      for (const b of sorted) {
        const [h, m] = b.start_time.split(":").map(Number)
        const startMin = h * 60 + m
        const endMin = startMin + Math.floor(b.duration_seconds / 60)
        if (currentMin >= startMin && currentMin < endMin) current = b
        else if (startMin > currentMin && !next) next = b
      }
      if (isRunningRef.current) {
        const runningIdx = sorted.findIndex((b) => b.id === currentBlockRef.current?.id)
        setNextBlock(runningIdx >= 0 ? sorted[runningIdx + 1] ?? null : next)
        return
      }
      setCurrentBlock(current)
      setNextBlock(next)
    }
    detect()
    const interval = setInterval(detect, 60_000)
    return () => clearInterval(interval)
  }, [scheduleBlocks])

  // Apply current block and auto-start at the scheduled time.
  // If a timer is already running when a new block starts, saves it and switches over.
  useEffect(() => {
    if (!currentBlock || categories.length === 0) return

    const blockChanged = currentBlock.id !== prevBlockIdRef.current
    prevBlockIdRef.current = currentBlock.id

    if (!blockChanged && isRunningRef.current) return

    const swHasContent = modeRef.current === "stopwatch" && swElapsedRef.current >= 30
    if (blockChanged && (isRunningRef.current || swIsRunningRef.current || swHasContent) && activeCategory) {
      if (isRunningRef.current) {
        const fullDur = fullDurationRef.current ?? chosenDuration
        fullDurationRef.current = null
        addSession({
          title: sessionTitle || null,
          category_name: activeCategory.name,
          category_color: activeCategory.color,
          duration_seconds: fullDur,
          elapsed_seconds: fullDur - seconds,
          completed: false,
        })
      } else if (swHasContent) {
        addSession({
          title: sessionTitle || null,
          category_name: activeCategory.name,
          category_color: activeCategory.color,
          duration_seconds: swElapsedRef.current,
          elapsed_seconds: swElapsedRef.current,
          completed: false,
        })
      }
      sw.reset()
      setMode("timer")
      setSessionTitle("")
    }

    const cat = categories.find((c) => c.name === currentBlock.category_name)
    if (cat) setActiveCategory(cat)
    const now = new Date()
    const [h, m] = currentBlock.start_time.split(":").map(Number)
    const blockStartMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0).getTime()
    const elapsedSec = Math.max(0, Math.floor((Date.now() - blockStartMs) / 1000))
    const remainingSec = Math.max(0, currentBlock.duration_seconds - elapsedSec)
    if (remainingSec > 30) {
      selectDuration(remainingSec)
      fullDurationRef.current = elapsedSec > 30 ? currentBlock.duration_seconds : null
    } else {
      selectDuration(currentBlock.duration_seconds)
      fullDurationRef.current = null
    }
    setSessionTitle(currentBlock.title || "")
    if (settings.autoStartScheduled && remainingSec > 0) {
      const delay = blockStartMs - Date.now()
      const tid = setTimeout(() => {
        if (!isRunningRef.current) toggle()
      }, Math.max(0, delay))
      return () => clearTimeout(tid)
    }
  }, [currentBlock?.id, categories.length])

  // Interruption counter
  useEffect(() => {
    if (!interruptionActive) return
    const id = setInterval(() => setInterruptionElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [interruptionActive])

  const handleInterrupt = () => {
    if (interruptionActive) {
      addSession({
        title: null, category_name: t.interruptionSessionName, category_color: "#FF6584",
        duration_seconds: interruptionElapsed, elapsed_seconds: interruptionElapsed, completed: true,
      })
      setInterruptionActive(false)
      setInterruptionElapsed(0)
      if (mode === "stopwatch") {
        if (wasRunningRef.current) sw.toggle()
      } else {
        jumpTo(savedSecondsRef.current)
        if (wasRunningRef.current) toggle()
      }
    } else {
      wasRunningRef.current = mode === "stopwatch" ? sw.isRunning : isRunning
      if (mode === "stopwatch") {
        if (sw.isRunning) sw.toggle()
      } else {
        savedSecondsRef.current = seconds
        if (isRunning) toggle()
      }
      setInterruptionActive(true)
      setInterruptionElapsed(0)
    }
  }

  const handleTerminate = () => {
    if (!activeCategory) return
    if (mode === "stopwatch") {
      if (sw.elapsed >= 30) addSession({
        title: sessionTitle || null, category_name: activeCategory.name, category_color: activeCategory.color,
        duration_seconds: sw.elapsed, elapsed_seconds: sw.elapsed, completed: false,
      })
      sw.reset(); setSessionTitle("")
      return
    }
    const fullDur = fullDurationRef.current ?? chosenDuration
    fullDurationRef.current = null
    addSession({
      title: sessionTitle || null, category_name: activeCategory.name, category_color: activeCategory.color,
      duration_seconds: fullDur, elapsed_seconds: fullDur - seconds, completed: false,
    })
    reset(); setSessionTitle(""); setFocusMode(false)
  }

  const advanceSchedule = () => {
    const todayDow = new Date().getDay()
    const sorted = scheduleBlocks.filter((b) => b.day_of_week === todayDow).sort((a, b) => a.start_time.localeCompare(b.start_time))
    const runningIdx = sorted.findIndex((b) => b.id === currentBlock?.id)
    const target = runningIdx >= 0 ? sorted[runningIdx + 1] ?? null : nextBlock
    if (!target) return
    const cat = categories.find((c) => c.name === target.category_name)
    if (cat) setActiveCategory(cat)
    selectDuration(target.duration_seconds)
    setSessionTitle(target.title || "")
    setCurrentBlock(target)
    setNextBlock(runningIdx >= 0 ? sorted[runningIdx + 2] ?? null : null)
  }

  const handleNext = () => {
    if (!activeCategory) return
    if (mode === "stopwatch") {
      if (sw.elapsed >= 30) addSession({
        title: sessionTitle || null, category_name: activeCategory.name, category_color: activeCategory.color,
        duration_seconds: sw.elapsed, elapsed_seconds: sw.elapsed, completed: true,
      })
      sw.reset(); setSessionTitle("")
      return
    }
    const fullDur = fullDurationRef.current ?? chosenDuration
    fullDurationRef.current = null
    addSession({
      title: sessionTitle || null, category_name: activeCategory.name, category_color: activeCategory.color,
      duration_seconds: fullDur, elapsed_seconds: fullDur - seconds, completed: seconds === 0,
    })
    reset(); setSessionTitle(""); setFocusMode(false); advanceSchedule()
  }

  const switchMode = (next: "timer" | "stopwatch") => {
    if (next === mode) return
    if (next === "stopwatch" && (isRunning || seconds < chosenDuration)) {
      setConfirmSwitchSW(true)
      return
    }
    if (isRunning) { reset(); setSessionTitle("") }
    if (sw.isRunning) { sw.reset(); setSessionTitle("") }
    setMode(next)
  }

  // Quick timer: require confirmation if a session is running or paused mid-way.
  const handleQuickTimer = (durationSec: number, label: string) => {
    const timerActive = isRunning || (seconds > 0 && seconds < chosenDuration)
    const swActive = mode === "stopwatch" && (sw.isRunning || sw.elapsed > 0)
    if (timerActive || swActive) {
      setConfirmQuick({ durationSec, label })
    } else {
      if (mode === "stopwatch") setMode("timer")
      selectDuration(durationSec)
    }
  }

  if (!activeCategory) return null

  const circleColor = settings.circleFixedColor
    ? settings.circleFixedColor
    : settings.circleStyle === "gradient" ? "#FFFFFF" : activeCategory.color
  const accentColor = settings.circleFixedColor && settings.circleStyle === "gradient"
    ? settings.circleFixedColor : activeCategory.color
  const activeCircleColor = interruptionActive ? "#FF6584" : circleColor
  const activeAccentColor = interruptionActive ? "#FF6584" : accentColor
  const interruptProp = settings.interruptionEnabled ? handleInterrupt : undefined
  const nextDisabled = mode === "timer" && nextBlock === null

  // Lap-based circle animation: even laps fill (empty→full), odd laps empty (full→empty).
  const LAP_DURATION          = 60
  const timerElapsed          = chosenDuration - seconds
  const timerLapNumber        = Math.floor(timerElapsed / LAP_DURATION)
  const lapElapsed            = timerElapsed % LAP_DURATION
  const timerLapPhase         = timerElapsed > 0
    ? (timerLapNumber % 2 === 0 ? "fill" : "erase") as "fill" | "erase"
    : undefined
  const timerLapPhaseProgress = timerElapsed > 0 ? lapElapsed / LAP_DURATION : undefined

  const visibleCats = !catsExpanded && categories.length > MAX_VISIBLE ? categories.slice(0, MAX_VISIBLE) : categories
  const visibleTimers = !timersExpanded && quickTimers.length > MAX_VISIBLE ? quickTimers.slice(0, MAX_VISIBLE) : quickTimers

  const btnBase: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", padding: "12px 0", letterSpacing: 1 }
  const primaryBtn: React.CSSProperties = { ...btnBase, border: `1px solid ${th.text}`, borderRadius: 100, width: 120, padding: "14px 0", color: th.text, fontSize: 16 }
  const secondaryBtn: React.CSSProperties = { ...btnBase, color: th.sub, fontSize: 15, width: 120 }

  if (focusMode) {
    return (
      <Background settings={settings} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 32 }}>
        <span style={{ color: th.sub, fontSize: 13, letterSpacing: 4, textTransform: "uppercase" }}>{activeCategory.name}</span>
        {sessionTitle && <span style={{ color: th.text, fontSize: 18, fontWeight: 300 }}>{sessionTitle}</span>}
        <CircularTimer
          progress={mode === "stopwatch" ? sw.progress : progress}
          seconds={mode === "stopwatch" ? sw.elapsed : seconds}
          color={activeCircleColor} accentColor={activeAccentColor}
          size={320}
          onReset={mode === "stopwatch" ? () => { sw.reset(); setSessionTitle("") } : () => { reset(); setSessionTitle("") }}
          onAddTime={mode === "stopwatch" ? undefined : addTime}
          onInterrupt={interruptProp}
          interruptionActive={interruptionActive}
          interruptionElapsed={interruptionElapsed}
          lapPhase={mode === "stopwatch" ? sw.phase : undefined}
          lapPhaseProgress={mode === "stopwatch" ? sw.phaseProgress : undefined}
          useGradient={settings.circleStyle === "gradient"} thick={settings.circleThick} textColor={th.text} trackColor={th.track} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <button style={primaryBtn} onClick={mode === "stopwatch" ? sw.toggle : toggle}>
            {(mode === "stopwatch" ? sw.isRunning : isRunning) ? t.pause : t.start}
          </button>
          <button style={{ ...secondaryBtn, opacity: nextDisabled ? 0.35 : 1 }} onClick={nextDisabled ? () => navigate("/schedule") : handleNext}>{t.next}</button>
          <button style={secondaryBtn} onClick={() => { handleTerminate(); if (mode === "timer") setFocusMode(false) }}>{t.terminate}</button>
        </div>
        <button onClick={() => setFocusMode(false)} style={{ ...btnBase, color: th.muted, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>{t.tapToExitFocus}</button>
      </Background>
    )
  }

  return (
    <Background settings={settings} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 24, padding: "24px 24px 24px 24px" }}>
      <h1 style={{ color: th.text, fontSize: 18, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", margin: 0 }}>FlowPilot</h1>

      <input
        type="text"
        value={sessionTitle}
        onChange={(e) => setSessionTitle(e.target.value)}
        placeholder={t.sessionTitlePlaceholder}
        style={{ background: "none", border: "none", borderBottom: `1px solid ${th.border}`, color: th.text, fontSize: 16, padding: "8px 0", textAlign: "center", outline: "none", width: "100%", maxWidth: 360 }}
      />

      {/* Categories */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {visibleCats.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat)}
            style={{
              background: "none", cursor: "pointer",
              padding: "6px 14px", borderRadius: 100,
              border: `1px solid ${activeCategory.id === cat.id ? cat.color : th.border}`,
              color: activeCategory.id === cat.id ? cat.color : th.sub,
              fontSize: 13,
            }}
          >
            {cat.name}
          </button>
        ))}
        {categories.length > MAX_VISIBLE && (
          <button onClick={() => setCatsExpanded(!catsExpanded)} style={{ background: "none", border: `1px solid ${th.border}`, borderRadius: 100, padding: "6px 14px", color: th.muted, fontSize: 13, cursor: "pointer" }}>
            {catsExpanded ? "▲" : "···"}
          </button>
        )}
      </div>

      {mode === "stopwatch" ? (
        <CircularTimer progress={sw.progress} seconds={sw.elapsed} color={activeCircleColor} accentColor={activeAccentColor}
          size={280}
          onReset={() => { sw.reset(); setSessionTitle("") }}
          onInterrupt={interruptProp} interruptionActive={interruptionActive} interruptionElapsed={interruptionElapsed}
          lapPhase={sw.phase} lapPhaseProgress={sw.phaseProgress}
          useGradient={settings.circleStyle === "gradient"} thick={settings.circleThick} textColor={th.text} trackColor={th.track} />
      ) : (
        <CircularTimer progress={progress} seconds={seconds} color={activeCircleColor} accentColor={activeAccentColor}
          size={280} onReset={() => { reset(); setSessionTitle("") }} onAddTime={addTime}
          onInterrupt={interruptProp} interruptionActive={interruptionActive} interruptionElapsed={interruptionElapsed}
          useGradient={settings.circleStyle === "gradient"} thick={settings.circleThick} textColor={th.text} trackColor={th.track} />
      )}

      {/* Quick timers + stopwatch toggle */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        <button
          onClick={() => switchMode(mode === "stopwatch" ? "timer" : "stopwatch")}
          style={{
            background: mode === "stopwatch" ? th.text : "none",
            border: `1px solid ${mode === "stopwatch" ? th.text : th.border}`, borderRadius: 100,
            padding: "8px 14px", color: mode === "stopwatch" ? th.inv : th.sub,
            fontSize: 13, cursor: "pointer",
          }}
        >
          ⏱
        </button>
        {visibleTimers.map((d) => (
          <button
            key={d.id}
            onClick={() => handleQuickTimer(d.seconds, d.label)}
            style={{
              background: mode === "timer" && chosenDuration === d.seconds ? th.text : "none",
              border: `1px solid ${th.border}`, borderRadius: 100,
              padding: "8px 14px", color: mode === "timer" && chosenDuration === d.seconds ? th.inv : th.sub,
              fontSize: 13, cursor: "pointer",
            }}
          >
            {d.label}
          </button>
        ))}
        {quickTimers.length > MAX_VISIBLE && (
          <button onClick={() => setTimersExpanded(!timersExpanded)} style={{ background: "none", border: `1px solid ${th.border}`, borderRadius: 100, padding: "8px 14px", color: th.muted, fontSize: 13, cursor: "pointer" }}>
            {timersExpanded ? "▲" : "···"}
          </button>
        )}
      </div>

      <button onClick={() => setFocusMode(true)} style={{ ...btnBase, color: th.muted, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>{t.focusMode}</button>

      {/* Controls */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center", width: "100%" }}>
          <button style={secondaryBtn} onClick={handleTerminate}>{t.terminate}</button>
          <button style={primaryBtn} onClick={mode === "stopwatch" ? sw.toggle : toggle}>
            {(mode === "stopwatch" ? sw.isRunning : isRunning) ? t.pause : t.start}
          </button>
          <button style={{ ...secondaryBtn, opacity: nextDisabled ? 0.35 : 1 }} onClick={nextDisabled ? () => navigate("/schedule") : handleNext}>{t.next}</button>
        </div>
        {nextBlock && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: nextBlock.category_color }} />
            <span style={{ color: th.muted, fontSize: 12, letterSpacing: 0.5 }}>
              {t.nextUp}: {nextBlock.title || nextBlock.category_name} · {nextBlock.start_time} · {fmtDuration(nextBlock.duration_seconds)}
            </span>
          </div>
        )}
      </div>

      {/* Switch-to-stopwatch confirmation modal */}
      {confirmSwitchSW && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 16, padding: 28, maxWidth: 320, width: "100%", textAlign: "center" }}>
            <p style={{ color: th.text, fontSize: 16, marginBottom: 8 }}>{t.stopCurrentTimer}</p>
            <p style={{ color: th.sub, fontSize: 14, marginBottom: 24 }}>
              {t.stopCurrentTimerMsg.replace("{label}", sessionTitle || activeCategory?.name || "")}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setConfirmSwitchSW(false)}
                style={{ background: "none", border: `1px solid ${th.border}`, borderRadius: 100, padding: "10px 24px", color: th.sub, fontSize: 14, cursor: "pointer" }}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => { reset(); setSessionTitle(""); setMode("stopwatch"); setConfirmSwitchSW(false) }}
                style={{ background: "#FF6584", border: "none", borderRadius: 100, padding: "10px 24px", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 500 }}
              >
                {t.terminate}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick timer confirmation modal */}
      {confirmQuick && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 16, padding: 28, maxWidth: 320, width: "100%", textAlign: "center" }}>
            <p style={{ color: th.text, fontSize: 16, marginBottom: 8 }}>{t.stopCurrentTimer}</p>
            <p style={{ color: th.sub, fontSize: 14, marginBottom: 24 }}>
              {t.stopCurrentTimerMsg.replace("{label}", confirmQuick.label)}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setConfirmQuick(null)}
                style={{ background: "none", border: `1px solid ${th.border}`, borderRadius: 100, padding: "10px 24px", color: th.sub, fontSize: 14, cursor: "pointer" }}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => { handleTerminate(); if (mode === "stopwatch") setMode("timer"); selectDuration(confirmQuick.durationSec); setConfirmQuick(null) }}
                style={{ background: th.text, border: "none", borderRadius: 100, padding: "10px 24px", color: th.inv, fontSize: 14, cursor: "pointer", fontWeight: 500 }}
              >
                {t.terminate}
              </button>
            </div>
          </div>
        </div>
      )}
    </Background>
  )
}
