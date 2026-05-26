// Single-user auth abstraction.
// To switch to Supabase Auth: replace body with
//   const { createClient } = await import("./supabase/server")
//   const supabase = await createClient()
//   return (await supabase.auth.getUser()).data.user!.id
export async function getCurrentUserId(): Promise<string> {
  return process.env.DEV_USER_ID!
}
