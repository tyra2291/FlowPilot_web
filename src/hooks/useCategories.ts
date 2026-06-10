// ─── useCategories hook ───────────────────────────────────────────────────────
// Manages the list of user-defined categories stored in the Supabase "categories" table.
// Categories are used as labels for timer sessions and schedule blocks.
// Consumed by: app/index.tsx, app/categories.tsx, app/schedule.tsx, app/session/[id].tsx.
import { useState, useEffect, useRef } from "react"
import { supabase } from "../lib/supabase"

// Shape of a category row as returned by Supabase.
export interface Category {
  id: string
  name: string
  color: string        // hex color string, e.g. "#6C63FF"
  sort_order: number   // display order in the category list and timer screen
}

// Seeded automatically for new users so the app is immediately usable.
// sort_order matches the array index for predictable ordering.
const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  { name: "Deep work", color: "#6C63FF", sort_order: 0 },
  { name: "Meetings",  color: "#FF6584", sort_order: 1 },
  { name: "Admin",     color: "#43B89C", sort_order: 2 },
  { name: "Learning",  color: "#F9A825", sort_order: 3 },
]

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  // Prevents concurrent calls (mount useEffect + useFocusEffect fire simultaneously
  // on first render and can both see an empty table, seeding duplicates).
  const inFlightRef = useRef(false)

  // Load on mount. Also exposed as loadCategories so app/index.tsx can
  // refresh the list when the screen regains focus (useFocusEffect).
  useEffect(() => {
    loadCategories()
  }, [])

  // Fetches categories ordered by sort_order.
  // If the table is empty for this user, seeds the default set automatically.
  const loadCategories = async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order")
      if (error) throw error

      if (data && data.length === 0) {
        await seedDefaultCategories(user.id)
      } else if (data) {
        setCategories(data)
      }
    } catch (e) {
      console.error("Failed to load categories", e)
    } finally {
      inFlightRef.current = false
      setLoading(false)
    }
  }

  // Inserts the default categories for a new user and stores the returned rows
  // (with their Supabase-generated IDs) in local state.
  const seedDefaultCategories = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert(DEFAULT_CATEGORIES.map((cat) => ({ ...cat, user_id: userId })))
        .select()
      if (error) throw error
      if (data) setCategories(data)
    } catch (e) {
      console.error("Failed to seed categories", e)
    }
  }

  // Inserts a new category. sort_order is set to the current list length
  // so it appends to the end. Updates local state optimistically.
  const addCategory = async (name: string, color: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("categories")
        .insert({ name, color, sort_order: categories.length, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      if (data) setCategories((prev) => [...prev, data])
    } catch (e) {
      console.error("Failed to add category", e)
    }
  }

  // Deletes a category by ID. Note: sessions that referenced this category
  // still retain their category_name / category_color snapshots (denormalized),
  // so historical data is not affected.
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)
      if (error) throw error
      setCategories((prev) => prev.filter((cat) => cat.id !== id))
    } catch (e) {
      console.error("Failed to delete category", e)
    }
  }

  // Swaps the sort_order of the category at `id` with its neighbour in the given direction.
  // Optimistic update first, then two Supabase UPDATEs in parallel.
  const reorderCategories = async (id: string, direction: "up" | "down") => {
    const idx = categories.findIndex((c) => c.id === id)
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= categories.length) return

    const a = categories[idx]
    const b = categories[swapIdx]

    setCategories((prev) => {
      const next = [...prev]
      next[idx]     = { ...a, sort_order: b.sort_order }
      next[swapIdx] = { ...b, sort_order: a.sort_order }
      return next.sort((x, y) => x.sort_order - y.sort_order)
    })

    await Promise.all([
      supabase.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id),
    ])
  }

  return { categories, loading, addCategory, deleteCategory, reorderCategories, loadCategories }
}
