export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { getLast12WeeksLogs, getTodayLogCountByHabit } from "@/lib/queries/habit-logs"
import type { Habit } from "@/lib/schemas"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    const supabase = createAdminClient()

    const { data: habit, error } = await supabase
      .from("habits")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (error || !habit) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // 전체 기간 로그 (달력용 — 최대 1년)
    const since = new Date()
    since.setFullYear(since.getFullYear() - 1)

    const { data: logs } = await supabase
      .from("habit_logs")
      .select("amount, logged_at")
      .eq("habit_id", id)
      .eq("user_id", userId)
      .gte("logged_at", since.toISOString())
      .order("logged_at", { ascending: true })

    // KST 기준 날짜별 합산
    const dailyMap: Record<string, number> = {}
    for (const row of logs ?? []) {
      const d = new Date(row.logged_at)
      const kstDate = new Date(d.getTime() + 9 * 60 * 60 * 1000)
      const key = kstDate.toISOString().slice(0, 10)
      dailyMap[key] = (dailyMap[key] ?? 0) + Number(row.amount)
    }

    const [todayCount, heatmap] = await Promise.all([
      getTodayLogCountByHabit(userId, id),
      getLast12WeeksLogs(userId, id),
    ])

    return NextResponse.json({
      habit: habit as Habit,
      dailyMap,
      todayCount,
      heatmap,
    })
  } catch (err) {
    console.error("[/api/habits/[id]]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
