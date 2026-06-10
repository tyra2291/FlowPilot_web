// ─── useSchedule hook ─────────────────────────────────────────────────────────
// Manages recurring weekly schedule blocks stored in the Supabase "schedule_blocks" table.
// A schedule block represents a planned work session at a specific day/time each week.
// Consumed by: app/schedule.tsx (CRUD) and app/index.tsx (auto-load current/next block).
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

// Shape of a schedule_blocks row as returned by Supabase.
export interface ScheduleBlock {
  id: string
  title: string | null      // optional label for this block (can be left blank)
  category_name: string     // denormalized snapshot of the category at creation time
  category_color: string    // denormalized snapshot of the category color
  duration_seconds: number  // intended session length
  start_time: string        // "HH:MM" 24-hour format, e.g. "09:00"
  day_of_week: number       // JS convention: 0 = Sunday, 1 = Monday … 6 = Saturday
}

export function useSchedule() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)

  // Load on mount. Also exposed as loadBlocks so app/index.tsx can
  // refresh when the screen regains focus.
  useEffect(() => {
    loadBlocks()
  }, [])

  // Fetches all schedule blocks ordered by day_of_week then start_time.
  // Supabase RLS ensures only the current user's rows are returned.
  const loadBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from("schedule_blocks")
        .select("id, title, category_name, category_color, duration_seconds, start_time, day_of_week")
        .order("day_of_week")
        .order("start_time")
      if (error) throw error
      setBlocks(data || [])
    } catch (e) {
      console.error("Failed to load schedule blocks", e)
    } finally {
      setLoading(false)
    }
  }

  // Inserts a new block and keeps the local array sorted by day + time
  // so the UI doesn't need to re-sort after each add.
  const addBlock = async (block: Omit<ScheduleBlock, "id">) => {
    try {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) return
      const { data, error } = await supabase
        .from("schedule_blocks")
        .insert({ ...block, user_id: authData.user.id })
        .select("id, title, category_name, category_color, duration_seconds, start_time, day_of_week")
        .single()
      if (error) throw error
      setBlocks(prev =>
        [...prev, data].sort((a, b) => {
          if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week
          return a.start_time.localeCompare(b.start_time)
        })
      )
    } catch (e) {
      console.error("Failed to add schedule block", e)
    }
  }

  // Updates an existing block by ID. Replaces all mutable fields.
  const updateBlock = async (id: string, updates: Omit<ScheduleBlock, "id">) => {
    try {
      const { data, error } = await supabase
        .from("schedule_blocks")
        .update(updates)
        .eq("id", id)
        .select("id, title, category_name, category_color, duration_seconds, start_time, day_of_week")
        .single()
      if (error) throw error
      setBlocks(prev =>
        prev
          .map(b => b.id === id ? data : b)
          .sort((a, b) => {
            if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week
            return a.start_time.localeCompare(b.start_time)
          })
      )
    } catch (e) {
      console.error("Failed to update schedule block", e)
    }
  }

  // Removes a block by ID and updates local state immediately.
  const deleteBlock = async (id: string) => {
    try {
      const { error } = await supabase.from("schedule_blocks").delete().eq("id", id)
      if (error) throw error
      setBlocks(prev => prev.filter(b => b.id !== id))
    } catch (e) {
      console.error("Failed to delete schedule block", e)
    }
  }

  return { blocks, loading, loadBlocks, addBlock, updateBlock, deleteBlock }
}
