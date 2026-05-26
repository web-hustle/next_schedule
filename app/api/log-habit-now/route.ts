export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth"
import { insertHabitLog } from "@/lib/queries/habit-logs"

export async function POST(req: NextRequest) {
  try {
    const { habit_id } = await req.json()
    if (!habit_id) {
      return NextResponse.json({ error: "habit_id is required" }, { status: 400 })
    }

    const userId = await getCurrentUserId()
    const log = await insertHabitLog(userId, habit_id, 1)
    return NextResponse.json({ log })
  } catch (err) {
    console.error("[/api/log-habit-now]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
