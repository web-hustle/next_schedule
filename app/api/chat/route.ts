export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth"
import { getHabits, appendAlias } from "@/lib/queries/habits"
import { getCategories } from "@/lib/queries/categories"
import { insertTodo } from "@/lib/queries/todos"
import { insertHabitLog } from "@/lib/queries/habit-logs"
import { insertChatMessage } from "@/lib/queries/chat"
import { parseUserInput } from "@/lib/gemini"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 })
    }

    const userId = await getCurrentUserId()

    // Save user message
    const userMsg = await insertChatMessage(userId, "user", text)

    const [habits, categories] = await Promise.all([
      getHabits(userId),
      getCategories(userId),
    ])

    const parsed = await parseUserInput(text, habits, categories)

    let assistantContent = ""
    let meta: Record<string, unknown> = { parse_result: parsed }
    let pendingAction: string | undefined

    if (parsed.type === "todo") {
      const { title, description, due_date, priority, category_hint } = parsed.data
      // Best-effort category matching
      const category = category_hint
        ? categories.find((c) => c.name.toLowerCase().includes(category_hint.toLowerCase()))
        : undefined

      const todo = await insertTodo(userId, {
        title,
        description,
        due_date,
        priority,
        category_id: category?.id,
      })
      assistantContent = `할일에 저장했어요: ${title}${due_date ? ` (마감 ${new Date(due_date).toLocaleDateString("ko-KR")})` : ""}`
      meta = { ...meta, todo_id: todo.id }
    } else if (parsed.type === "habit_log") {
      const { habit_id, matched_term, amount, logged_at, note } = parsed.data
      const habit = habits.find((h) => h.id === habit_id)
      if (!habit) {
        assistantContent = "습관을 찾지 못했어요."
      } else {
        await insertHabitLog(userId, habit_id, amount, logged_at, note)

        // Quietly append alias if matched_term is new
        const allTerms = [habit.name, ...habit.aliases]
        if (!allTerms.includes(matched_term)) {
          appendAlias(habit_id, matched_term).catch(() => {})
        }

        assistantContent = `「${habit.name}」에 ${amount}${habit.unit} 기록했어요`
        meta = { ...meta, habit_id, log_amount: amount }
      }
    } else if (parsed.type === "habit_suggestion") {
      const { suggested_name, suggested_unit, inferred_amount, inferred_logged_at } = parsed.data
      assistantContent = `「${suggested_name}」 습관이 없네요. 새로 추가할까요?`
      meta = {
        ...meta,
        pending_action: "create_habit",
        suggested_name,
        suggested_unit,
        inferred_amount,
        inferred_logged_at,
      }
      pendingAction = "create_habit"
    } else {
      assistantContent = `잘 못 알아들었어요: ${parsed.reason}`
    }

    const assistantMsg = await insertChatMessage(userId, "assistant", assistantContent, meta)

    return NextResponse.json({
      user_msg: userMsg,
      assistant_msg: assistantMsg,
      ...(pendingAction ? { pending_action: pendingAction } : {}),
    })
  } catch (err) {
    console.error("[/api/chat]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
