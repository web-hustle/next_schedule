import { createAdminClient } from "../supabase/admin"
import type { Todo } from "../schemas"

export async function getTodos(userId: string): Promise<Todo[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("todos")
    .select("*, categories(name, color)")
    .eq("user_id", userId)
    .eq("is_done", false)
    .order("priority", { ascending: false, nullsFirst: false })
    .order("due_date", { ascending: true, nullsFirst: false })

  if (error) throw error
  return data as Todo[]
}

export async function insertTodo(
  userId: string,
  payload: {
    title: string
    description?: string
    due_date?: string
    category_id?: string
    priority?: number
  }
): Promise<Todo> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("todos")
    .insert({ user_id: userId, ...payload })
    .select()
    .single()

  if (error) throw error
  return data as Todo
}

export async function toggleTodo(userId: string, todoId: string, isDone: boolean): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("todos")
    .update({ is_done: isDone })
    .eq("id", todoId)
    .eq("user_id", userId)

  if (error) throw error
}
