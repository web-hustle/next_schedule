"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HabitLogConfirmDialog } from "./habit-log-confirm-dialog"
import { HabitMiniHeatmap } from "./habit-mini-heatmap"
import { Plus } from "lucide-react"
import type { Habit } from "@/lib/schemas"

interface HabitWithStats {
  habit: Habit
  todayCount: number
  heatmap: Record<string, number>
}

interface Props {
  habits: HabitWithStats[]
  onLogged: () => void
}

export function HabitButtonGrid({ habits, onLogged }: Props) {
  const router = useRouter()
  const [pendingLog, setPendingLog] = useState<HabitWithStats | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleConfirmLog() {
    if (!pendingLog) return
    await fetch("/api/log-habit-now", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit_id: pendingLog.habit.id }),
    })
    setPendingLog(null)
    startTransition(() => { onLogged() })
  }

  if (habits.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-4">
        등록된 습관이 없어요. 아래 버튼으로 추가해보세요.
      </p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {habits.map((item) => (
          <Card
            key={item.habit.id}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => router.push(`/habits/${item.habit.id}`)}
          >
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-1">
                <span className="font-semibold text-sm leading-tight flex-1 min-w-0 truncate">
                  {item.habit.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {item.todayCount}{item.habit.unit}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-full hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation() // 카드 클릭 이벤트 막기
                      setPendingLog(item)
                    }}
                    disabled={isPending}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <HabitMiniHeatmap logs={item.heatmap} />
            </CardContent>
          </Card>
        ))}
      </div>

      {pendingLog && (
        <HabitLogConfirmDialog
          habitName={pendingLog.habit.name}
          open={!!pendingLog}
          onOpenChange={(o) => { if (!o) setPendingLog(null) }}
          onConfirm={handleConfirmLog}
        />
      )}
    </>
  )
}
