import { createAdminClient } from "../supabase/admin"
import type { ChatMessage } from "../schemas"

export async function getChatMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data as ChatMessage[]).reverse()
}

export async function insertChatMessage(
  userId: string,
  role: "user" | "assistant",
  content: string,
  meta?: Record<string, unknown>
): Promise<ChatMessage> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ user_id: userId, role, content, meta: meta ?? null })
    .select()
    .single()

  if (error) throw error
  return data as ChatMessage
}

export async function getChatMessageById(id: string): Promise<ChatMessage | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data as ChatMessage
}
