export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth"
import { getHabits } from "@/lib/queries/habits"
import { getTodayLogCountByHabit, getLast12WeeksLogs } from "@/lib/queries/habit-logs"

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    const habits = await getHabits(userId)

    const habitsWithStats = await Promise.all(
      habits.map(async (habit) => {
        const [todayCount, heatmap] = await Promise.all([
          getTodayLogCountByHabit(userId, habit.id),
          getLast12WeeksLogs(userId, habit.id),
        ])
        return { habit, todayCount, heatmap }
      })
    )

    return NextResponse.json(habitsWithStats)
  } catch (err) {
    console.error("[/api/dashboard/habits]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
