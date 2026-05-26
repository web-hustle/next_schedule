import { createAdminClient } from "../supabase/admin"
import type { Category } from "../schemas"

export async function getCategories(userId: string): Promise<Category[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true })

  if (error) throw error
  return data as Category[]
}
