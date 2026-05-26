export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth"
import { toggleTodo } from "@/lib/queries/todos"

export async function POST(req: NextRequest) {
  try {
    const { todo_id, is_done } = await req.json()
    if (!todo_id || is_done === undefined) {
      return NextResponse.json({ error: "todo_id and is_done are required" }, { status: 400 })
    }

    const userId = await getCurrentUserId()
    await toggleTodo(userId, todo_id, is_done)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[/api/toggle-todo]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
