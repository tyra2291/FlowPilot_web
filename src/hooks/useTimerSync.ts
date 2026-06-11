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

  // Broadcast fires immediately for real-time updates.
  // Presence track stores current state so late-joining devices receive it on subscribe.
  const push = useCallback((state: RemoteTimerState) => {
    const ch = channelRef.current
    if (!ch) return
    ch.send({
      type: "broadcast",
      event: "timer_update",
      payload: { ...state, device_id: DEVICE_ID },
    })
    ch.track({ ...state, device_id: DEVICE_ID })
  }, [])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user
      if (!user) return
      channel = supabase
        .channel(`timer:${user.id}`)
        // Real-time updates from other devices
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
        // Presence sync: fires on subscribe with the current state of all tracked devices.
        // Lets this device catch up if it joins while another device's timer is already running.
        .on("presence", { event: "sync" }, () => {
          if (!channel) return
          const presState = channel.presenceState<RemoteTimerState & { device_id: string }>()
          for (const presences of Object.values(presState)) {
            const remote = presences[0]
            if (remote && remote.device_id !== DEVICE_ID) {
              cbRef.current({
                is_running: remote.is_running,
                end_time_ms: remote.end_time_ms,
                seconds_remaining: remote.seconds_remaining,
                category_name: remote.category_name,
                category_color: remote.category_color,
                title: remote.title,
              })
              break
            }
          }
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
