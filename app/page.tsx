"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TodoList } from "@/components/todo-list"
import { HabitButtonGrid } from "@/components/habit-button-grid"
import { NewHabitDialog } from "@/components/new-habit-dialog"
import { MessageSquare, Plus } from "lucide-react"
import type { Todo, Habit } from "@/lib/schemas"

interface HabitWithStats {
  habit: Habit
  todayCount: number
  heatmap: Record<string, number>
}

async function fetchDashboard() {
  const [todosRes, habitsRes] = await Promise.all([
    fetch("/api/dashboard/todos"),
    fetch("/api/dashboard/habits"),
  ])
  const todos: Todo[] = await todosRes.json()
  const habitsWithStats: HabitWithStats[] = await habitsRes.json()
  return { todos, habitsWithStats }
}

async function toggleTodo(todoId: string, isDone: boolean) {
  await fetch("/api/toggle-todo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ todo_id: todoId, is_done: isDone }),
  })
}

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [habitsWithStats, setHabitsWithStats] = useState<HabitWithStats[]>([])
  const [newHabitOpen, setNewHabitOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await fetchDashboard()
      setTodos(data.todos)
      setHabitsWithStats(data.habitsWithStats)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">대시보드</h1>
          <Link href="/chat">
            <Button variant="outline" size="sm" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              채팅
            </Button>
          </Link>
        </div>

        {/* Todos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">할일</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">불러오는 중...</p>
            ) : (
              <TodoList todos={todos} onToggle={toggleTodo} />
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Habits */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">습관</h2>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setNewHabitOpen(true)}
            >
              <Plus className="h-4 w-4" />
              새 습관
            </Button>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">불러오는 중...</p>
          ) : (
            <HabitButtonGrid habits={habitsWithStats} onLogged={load} />
          )}
        </div>
      </div>

      <NewHabitDialog
        open={newHabitOpen}
        onOpenChange={setNewHabitOpen}
        onCreated={load}
      />
    </main>
  )
}
