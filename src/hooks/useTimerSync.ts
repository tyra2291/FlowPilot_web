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

const DEVICE_ID = crypto.randomUUID()

export function useTimerSync(onRemoteUpdate: (s: RemoteTimerState) => void) {
  const cbRef = useRef(onRemoteUpdate)
  cbRef.current = onRemoteUpdate
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Broadcast is fire-and-forget — no DB write, no latency.
  const push = useCallback((state: RemoteTimerState) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "timer_update",
      payload: { ...state, device_id: DEVICE_ID },
    })
  }, [])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user
      if (!user) return
      channel = supabase
        .channel(`timer:${user.id}`)
        .on("broadcast", { event: "timer_update" }, ({ payload }: any) => {
          if (!payload || payload.device_id === DEVICE_ID) return
          cbRef.current({
            is_running: payload.is_running,
            end_time_ms: payload.end_time_ms,
            seconds_remaining: payload.seconds_remaining,
            category_name: payload.category_name,
            category_color: payload.category_color,
            title: payload.title,
          })
        })
        .subscribe()
      channelRef.current = channel
    })
    return () => {
      if (channel) supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [])

  return { push }
}
