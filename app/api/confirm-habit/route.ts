export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth"
import { insertHabit } from "@/lib/queries/habits"
import { insertHabitLog } from "@/lib/queries/habit-logs"
import { insertChatMessage, getChatMessageById } from "@/lib/queries/chat"

export async function POST(req: NextRequest) {
  try {
    const { message_id } = await req.json()
    if (!message_id) {
      return NextResponse.json({ error: "message_id is required" }, { status: 400 })
    }

    const userId = await getCurrentUserId()
    const msg = await getChatMessageById(message_id)

    if (!msg || msg.user_id !== userId || msg.meta?.pending_action !== "create_habit") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 })
    }

    const { suggested_name, suggested_unit, inferred_amount, inferred_logged_at } =
      msg.meta as {
        suggested_name: string
        suggested_unit: string
        inferred_amount: number
        inferred_logged_at: string
      }

    const habit = await insertHabit(userId, {
      name: suggested_name,
      unit: suggested_unit ?? "회",
    })

    await insertHabitLog(
      userId,
      habit.id,
      inferred_amount ?? 1,
      inferred_logged_at
    )

    const confirmMsg = await insertChatMessage(
      userId,
      "assistant",
      `「${suggested_name}」 습관을 만들고 ${inferred_amount ?? 1}${suggested_unit ?? "회"} 기록했어요`
    )

    return NextResponse.json({ habit, confirm_msg: confirmMsg })
  } catch (err) {
    console.error("[/api/confirm-habit]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
