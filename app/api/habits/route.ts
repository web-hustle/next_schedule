export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth"
import { insertHabit } from "@/lib/queries/habits"

export async function POST(req: NextRequest) {
  try {
    const { name, unit, aliases } = await req.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const userId = await getCurrentUserId()
    const habit = await insertHabit(userId, {
      name: name.trim(),
      unit: unit?.trim() || "회",
      aliases: Array.isArray(aliases) ? aliases : [],
    })
    return NextResponse.json({ habit })
  } catch (err) {
    console.error("[/api/habits]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
