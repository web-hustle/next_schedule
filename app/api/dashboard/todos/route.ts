export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth"
import { getTodos } from "@/lib/queries/todos"

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    const todos = await getTodos(userId)
    return NextResponse.json(todos)
  } catch (err) {
    console.error("[/api/dashboard/todos]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
