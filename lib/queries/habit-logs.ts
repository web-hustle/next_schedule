import { createAdminClient } from "../supabase/admin"
import type { HabitLog } from "../schemas"

export async function insertHabitLog(
  userId: string,
  habitId: string,
  amount: number = 1,
  loggedAt?: string,
  note?: string
): Promise<HabitLog> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("habit_logs")
    .insert({
      user_id: userId,
      habit_id: habitId,
      amount,
      logged_at: loggedAt ?? new Date().toISOString(),
      note: note ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as HabitLog
}

export async function getTodayLogCountByHabit(
  userId: string,
  habitId: string
): Promise<number> {
  const supabase = createAdminClient()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from("habit_logs")
    .select("amount")
    .eq("user_id", userId)
    .eq("habit_id", habitId)
    .gte("logged_at", todayStart.toISOString())

  if (error) throw error
  return (data ?? []).reduce((sum, r) => sum + Number(r.amount), 0)
}

// Returns daily totals for the last 12 weeks (84 days) keyed by YYYY-MM-DD (KST)
export async function getLast12WeeksLogs(
  userId: string,
  habitId: string
): Promise<Record<string, number>> {
  const supabase = createAdminClient()
  const since = new Date()
  since.setDate(since.getDate() - 84)

  const { data, error } = await supabase
    .from("habit_logs")
    .select("amount, logged_at")
    .eq("user_id", userId)
    .eq("habit_id", habitId)
    .gte("logged_at", since.toISOString())
    .order("logged_at", { ascending: true })

  if (error) throw error

  const result: Record<string, number> = {}
  for (const row of data ?? []) {
    // Convert to KST date key
    const d = new Date(row.logged_at)
    const kstOffset = 9 * 60
    const kstDate = new Date(d.getTime() + kstOffset * 60 * 1000)
    const key = kstDate.toISOString().slice(0, 10)
    result[key] = (result[key] ?? 0) + Number(row.amount)
  }
  return result
}
