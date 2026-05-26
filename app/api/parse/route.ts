export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth"
import { getHabits } from "@/lib/queries/habits"
import { getCategories } from "@/lib/queries/categories"
import { parseUserInput } from "@/lib/gemini"
import type { ParseResult } from "@/lib/schemas"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 })
    }

    const userId = await getCurrentUserId()
    const [habits, categories] = await Promise.all([
      getHabits(userId),
      getCategories(userId),
    ])

    const result: ParseResult = await parseUserInput(text, habits, categories)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[/api/parse]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
