import { useEffect, useRef, useCallback } from "react"
import { supabase } from "../lib/supabase"

export interface RemoteTimerState {
  is_running: boolean
  end_time_ms: number | null
  seconds_remaining: number
  category_name: string
  category_color: string
  title: string | null
}

// Stable per-tab ID so we can filter out our own Realtime echoes.
const DEVICE_ID = crypto.randomUUID()

export function useTimerSync(onRemoteUpdate: (s: RemoteTimerState) => void) {
  const cbRef = useRef(onRemoteUpdate)
  cbRef.current = onRemoteUpdate

  const push = useCallback(async (state: RemoteTimerState) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { console.warn("[TimerSync] push: no session"); return }
    const user = session.user
    console.log("[TimerSync] pushing state:", state.is_running, "seconds:", state.seconds_remaining)
    const { error } = await supabase.from("timer_state").upsert({
      user_id: user.id,
      device_id: DEVICE_ID,
      is_running: state.is_running,
      end_time_ms: state.end_time_ms,
      seconds_remaining: state.seconds_remaining,
      category_name: state.category_name,
      category_color: state.category_color,
      title: state.title,
      updated_at: new Date().toISOString(),
    })
    if (error) console.error("[TimerSync] upsert error:", error)
  }, [])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user
      if (!user) return
      const channelId = crypto.randomUUID()
      channel = supabase
        .channel(`timer:${user.id}:${channelId}`)
        .on("postgres_changes" as any, {
          event: "*",
          schema: "public",
          table: "timer_state",
          filter: `user_id=eq.${user.id}`,
        }, (payload: any) => {
          console.log("[TimerSync] received event, device_id match:", payload.new?.device_id === DEVICE_ID)
          const row = payload.new
          if (!row || row.device_id === DEVICE_ID) return
          cbRef.current({
            is_running: row.is_running,
            end_time_ms: row.end_time_ms,
            seconds_remaining: row.seconds_remaining,
            category_name: row.category_name,
            category_color: row.category_color,
            title: row.title,
          })
        })
        .subscribe((status, err) => {
          console.log("[TimerSync] subscription status:", status, err ?? "")
        })
    })
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [])

  return { push }
}
