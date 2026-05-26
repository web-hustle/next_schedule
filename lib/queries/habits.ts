import { createAdminClient } from "../supabase/admin"
import type { Habit } from "../schemas"

export async function getHabits(userId: string): Promise<Habit[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data as Habit[]
}

export async function insertHabit(
  userId: string,
  payload: {
    name: string
    unit: string
    aliases?: string[]
    target_per_day?: number
    category_id?: string
  }
): Promise<Habit> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("habits")
    .insert({ user_id: userId, aliases: [], ...payload })
    .select()
    .single()

  if (error) throw error
  return data as Habit
}

export async function appendAlias(habitId: string, alias: string): Promise<void> {
  const supabase = createAdminClient()
  // Use array_append via RPC or fetch then update
  const { data: habit, error: fetchErr } = await supabase
    .from("habits")
    .select("aliases")
    .eq("id", habitId)
    .single()

  if (fetchErr) throw fetchErr

  const existing: string[] = habit.aliases ?? []
  if (existing.includes(alias)) return

  const { error } = await supabase
    .from("habits")
    .update({ aliases: [...existing, alias] })
    .eq("id", habitId)

  if (error) throw error
}
