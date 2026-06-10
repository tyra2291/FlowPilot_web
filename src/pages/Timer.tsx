import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useTimer } from "../hooks/useTimer"
import { useCategories, Category } from "../hooks/useCategories"
import { useQuickTimers } from "../hooks/useQuickTimers"
import { useSessions } from "../hooks/useSessions"
import { useSchedule, ScheduleBlock } from "../hooks/useSchedule"
import { useSubscription } from "../hooks/useSubscription"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../lib/i18n"
import Background from "../components/Background"
import CircularTimer from "../components/CircularTimer"

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

  const { seconds, chosenDuration, isRunning, progress, selectDuration, reset, toggle, addTime, jumpTo } = useTimer(25 * 60)
  const { categories } = useCategories()
  const { quickTimers } = useQuickTimers()
  const { addSession, pruneOldSessions } = useSessions()
  const { isPremium, loading: subLoading } = useSubscription()
  const { blocks: scheduleBlocks } = useSchedule()

  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [sessionTitle, setSessionTitle] = useState("")
  const [focusMode, setFocusMode] = useState(false)
  const [catsExpanded, setCatsExpanded] = useState(false)
  const [timersExpanded, setTimersExpanded] = useState(false)
  const [currentBlock, setCurrentBlock] = useState<ScheduleBlock | null>(null)
  const [nextBlock, setNextBlock] = useState<ScheduleBlock | null>(null)
  const [interruptionActive, setInterruptionActive] = useState(false)
  const [interruptionElapsed, setInterruptionElapsed] = useState(0)
  const savedSecondsRef = useRef(0)
  const wasRunningRef = useRef(false)
  const isRunningRef = useRef(isRunning)
  const currentBlockRef = useRef<ScheduleBlock | null>(null)
  const nextBlockRef = useRef<ScheduleBlock | null>(null)
  const fullDurationRef = useRef<number | null>(null)
  isRunningRef.current = isRunning
  currentBlockRef.current = currentBlock
  nextBlockRef.current = nextBlock

  useEffect(() => {
    if (!subLoading && !isPremium) pruneOldSessions()
  }, [subLoading])

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) setActiveCategory(categories[0])
  }, [categories])

  // Auto-save on completion
  useEffect(() => {
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

  // Apply current block
  useEffect(() => {
    if (currentBlock && categories.length > 0 && !isRunning) {
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
      if (settings.autoStartScheduled) toggle()
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
      jumpTo(savedSecondsRef.current)
      if (wasRunningRef.current) toggle()
    } else {
      savedSecondsRef.current = seconds
      wasRunningRef.current = isRunning
      if (isRunning) toggle()
      setInterruptionActive(true)
      setInterruptionElapsed(0)
    }
  }

  const handleTerminate = () => {
    if (!activeCategory) return
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
    const fullDur = fullDurationRef.current ?? chosenDuration
    fullDurationRef.current = null
    addSession({
      title: sessionTitle || null, category_name: activeCategory.name, category_color: activeCategory.color,
      duration_seconds: fullDur, elapsed_seconds: fullDur - seconds, completed: seconds === 0,
    })
    reset(); setSessionTitle(""); setFocusMode(false); advanceSchedule()
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
  const nextDisabled = nextBlock === null

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
        <CircularTimer progress={progress} seconds={seconds} color={activeCircleColor} accentColor={activeAccentColor}
          size={320} onReset={() => { reset(); setSessionTitle("") }} onAddTime={addTime}
          onInterrupt={interruptProp} interruptionActive={interruptionActive} interruptionElapsed={interruptionElapsed}
          useGradient={settings.circleStyle === "gradient"} textColor={th.text} trackColor={th.track} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <button style={primaryBtn} onClick={toggle}>{isRunning ? t.pause : t.start}</button>
          <button style={{ ...secondaryBtn, opacity: nextDisabled ? 0.35 : 1 }} onClick={nextDisabled ? () => navigate("/schedule") : handleNext}>{t.next}</button>
          <button style={secondaryBtn} onClick={() => { handleTerminate(); setFocusMode(false) }}>{t.terminate}</button>
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

      <CircularTimer progress={progress} seconds={seconds} color={activeCircleColor} accentColor={activeAccentColor}
        size={280} onReset={() => { reset(); setSessionTitle("") }} onAddTime={addTime}
        onInterrupt={interruptProp} interruptionActive={interruptionActive} interruptionElapsed={interruptionElapsed}
        useGradient={settings.circleStyle === "gradient"} textColor={th.text} trackColor={th.track} />

      {/* Quick timers */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {visibleTimers.map((d) => (
          <button
            key={d.id}
            onClick={() => selectDuration(d.seconds)}
            style={{
              background: chosenDuration === d.seconds ? th.text : "none",
              border: `1px solid ${th.border}`, borderRadius: 100,
              padding: "8px 14px", color: chosenDuration === d.seconds ? th.inv : th.sub,
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
          <button style={primaryBtn} onClick={toggle}>{isRunning ? t.pause : t.start}</button>
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
    </Background>
  )
}
