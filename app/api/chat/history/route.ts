export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth"
import { getChatMessages } from "@/lib/queries/chat"

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    const messages = await getChatMessages(userId, 100)
    return NextResponse.json(messages)
  } catch (err) {
    console.error("[/api/chat/history]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
