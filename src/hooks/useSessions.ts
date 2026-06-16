// ─── useSessions hook ─────────────────────────────────────────────────────────
// Manages the list of timer sessions stored in the Supabase "sessions" table.
// Each session represents one completed or terminated timer run.
// Consumed by: app/index.tsx (write), app/history.tsx (read + delete + prune),
//              app/dashboard.tsx (read for stats), app/session/[id].tsx (edit).
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

// Shape of a session row as returned by Supabase.
// category_name and category_color are stored directly (denormalized) so that
// sessions remain readable even if the original category is renamed or deleted.
export interface Session {
  id: string
  title: string | null           // optional user-provided label
  category_name: string          // snapshot of the category name at session time
  category_color: string         // snapshot of the category color at session time
  duration_seconds: number       // total timer duration the user set
  elapsed_seconds: number        // actual time that ran before stop/completion
  completed: boolean             // true = timer reached zero; false = user stopped early
  completed_at: string           // ISO 8601 UTC timestamp, set by Supabase default
}

// Free plan: sessions older than this many days are deleted by pruneOldSessions().
export const FREE_HISTORY_DAYS = 7

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])

  // Load sessions on mount. Supabase RLS policies ensure only the current user's
  // rows are returned, so no explicit user_id filter is needed here.
  useEffect(() => {
    loadSessions()
  }, [])

  // Fetches all sessions ordered newest-first.
  // Results are used as-is for the history list and passed to computeStats in dashboard.tsx.
  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order("completed_at", { ascending: false })
      console.log("data:", data, "error:", error)
      if (error) throw error
      if (data) setSessions(data)
    } catch (e) {
      console.error("Failed to load sessions", e)
    }
  }

  // Inserts a new session row and prepends it to the local state so the history
  // list updates instantly without a re-fetch.
  // Called by app/index.tsx when the timer completes (completed: true) or is
  // terminated early (completed: false).
  const addSession = async (session: Omit<Session, "id" | "completed_at">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user logged in")

      const { data, error } = await supabase
        .from("sessions")
        .insert({ ...session, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      if (data) setSessions((prev) => [data, ...prev])
    } catch (e) {
      console.error("Failed to save session", e)
    }
  }

  // Deletes sessions older than FREE_HISTORY_MONTHS from Supabase and trims
  // local state immediately.
  // Should only be called for Standard (non-premium) users.
  // Called from app/history.tsx on mount so the cleanup happens when the user
  // opens their history — a natural trigger that doesn't require a background job.
  const pruneOldSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Compute the cutoff date: midnight FREE_HISTORY_DAYS ago (local time).
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - FREE_HISTORY_DAYS)
      cutoff.setHours(0, 0, 0, 0)

      // Delete rows older than the cutoff from Supabase.
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("user_id", user.id)
        .lt("completed_at", cutoff.toISOString())

      if (error) throw error

      // Sync local state without a full reload.
      setSessions(prev => prev.filter(s => new Date(s.completed_at) >= cutoff))
    } catch (e) {
      console.error("Failed to prune old sessions", e)
    }
  }

  // setSessions is exposed so that history.tsx can optimistically remove a deleted
  // session from the list without waiting for a full reload.
  return { sessions, setSessions, addSession, pruneOldSessions, loadSessions }
}
