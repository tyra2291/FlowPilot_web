// ─── useQuickTimers hook ──────────────────────────────────────────────────────
// Manages the user's list of quick-access timer presets stored in the
// Supabase "quick_timers" table.
// Quick timers appear as duration buttons on the main timer screen (app/index.tsx)
// and are managed from the Quick Timers settings screen (app/quick-timers.tsx).
import { useState, useEffect, useRef } from "react"
import { supabase } from "../lib/supabase"

// Shape of a quick_timers row as returned by Supabase.
export interface QuickTimer {
  id: string
  label: string       // display name shown on the button, e.g. "25 min"
  seconds: number     // duration value in seconds
  sort_order: number  // display order on the main screen
}

const DEFAULT_QUICK_TIMERS = [
  { label: "5 min",  seconds:  5 * 60, sort_order: 0 },
  { label: "15 min", seconds: 15 * 60, sort_order: 1 },
  { label: "25 min", seconds: 25 * 60, sort_order: 2 },
  { label: "60 min", seconds: 60 * 60, sort_order: 3 },
]

export function useQuickTimers() {
  const [quickTimers, setQuickTimers] = useState<QuickTimer[]>([])
  const [loading, setLoading] = useState(true)
  // Prevents concurrent calls (mount useEffect + useFocusEffect fire simultaneously
  // on first render and can both see an empty table, seeding duplicates).
  const inFlightRef = useRef(false)

  // Load on mount. Also exposed as loadQuickTimers so app/index.tsx can
  // refresh when the screen regains focus.
  useEffect(() => {
    loadQuickTimers()
  }, [])

  // Fetches quick timers ordered by sort_order.
  // Seeds defaults automatically if the table is empty for this user.
  const loadQuickTimers = async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("quick_timers")
        .select("*")
        .order("sort_order")
      if (error) throw error

      if (data && data.length === 0) {
        await seedDefaultQuickTimers(user.id)
      } else if (data) {
        setQuickTimers(data)
      }
    } catch (e) {
      console.error("Failed to load quick timers", e)
    } finally {
      inFlightRef.current = false
      setLoading(false)
    }
  }

  // Inserts the default presets for a brand-new user.
  const seedDefaultQuickTimers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("quick_timers")
        .insert(DEFAULT_QUICK_TIMERS.map((t) => ({ ...t, user_id: userId })))
        .select()
      if (error) throw error
      if (data) setQuickTimers(data)
    } catch (e) {
      console.error("Failed to seed quick timers", e)
    }
  }

  // Adds a new preset. sort_order appends to the end of the current list.
  const addQuickTimer = async (label: string, seconds: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from("quick_timers")
        .insert({ label, seconds, sort_order: quickTimers.length, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      if (data) setQuickTimers((prev) => [...prev, data])
    } catch (e) {
      console.error("Failed to add quick timer", e)
    }
  }

  // Removes a preset by ID and updates local state immediately.
  const deleteQuickTimer = async (id: string) => {
    try {
      const { error } = await supabase.from("quick_timers").delete().eq("id", id)
      if (error) throw error
      setQuickTimers((prev) => prev.filter((t) => t.id !== id))
    } catch (e) {
      console.error("Failed to delete quick timer", e)
    }
  }

  // Swaps the sort_order of the timer at `id` with its neighbour in the given direction.
  // Optimistic update first, then two Supabase UPDATEs in parallel.
  const reorderQuickTimers = async (id: string, direction: "up" | "down") => {
    const idx = quickTimers.findIndex((t) => t.id === id)
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= quickTimers.length) return

    const a = quickTimers[idx]
    const b = quickTimers[swapIdx]

    setQuickTimers((prev) => {
      const next = [...prev]
      next[idx]     = { ...a, sort_order: b.sort_order }
      next[swapIdx] = { ...b, sort_order: a.sort_order }
      return next.sort((x, y) => x.sort_order - y.sort_order)
    })

    await Promise.all([
      supabase.from("quick_timers").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("quick_timers").update({ sort_order: a.sort_order }).eq("id", b.id),
    ])
  }

  return { quickTimers, loading, addQuickTimer, deleteQuickTimer, reorderQuickTimers, loadQuickTimers }
}
