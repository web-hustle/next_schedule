import { z } from "zod"

// Gemini parse result schema
export const ParseResultSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("todo"),
    data: z.object({
      title: z.string(),
      description: z.string().optional(),
      due_date: z.string().optional(), // ISO string
      category_hint: z.string().optional(),
      priority: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
    }),
  }),
  z.object({
    type: z.literal("habit_log"),
    data: z.object({
      habit_id: z.string(),
      matched_term: z.string(),
      amount: z.number(),
      logged_at: z.string(), // ISO string
      note: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("habit_suggestion"),
    data: z.object({
      suggested_name: z.string(),
      suggested_unit: z.string(),
      inferred_amount: z.number(),
      inferred_logged_at: z.string(), // ISO string
    }),
  }),
  z.object({
    type: z.literal("unknown"),
    reason: z.string(),
  }),
])

export type ParseResult = z.infer<typeof ParseResultSchema>

// DB row types
export type Category = {
  id: string
  user_id: string
  name: string
  color: string | null
  created_at: string
}

export type Todo = {
  id: string
  user_id: string
  category_id: string | null
  title: string
  description: string | null
  due_date: string | null
  is_done: boolean
  priority: number | null
  created_at: string
  categories?: { name: string; color: string | null } | null
}

export type Habit = {
  id: string
  user_id: string
  category_id: string | null
  name: string
  aliases: string[]
  unit: string
  target_per_day: number | null
  created_at: string
}

export type HabitLog = {
  id: string
  user_id: string
  habit_id: string
  amount: number
  note: string | null
  logged_at: string
  created_at: string
}

export type ChatMessage = {
  id: string
  user_id: string
  role: "user" | "assistant"
  content: string
  meta: Record<string, unknown> | null
  created_at: string
}
