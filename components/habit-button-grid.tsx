"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HabitLogConfirmDialog } from "./habit-log-confirm-dialog"
import { HabitMiniHeatmap } from "./habit-mini-heatmap"
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
  const [selected, setSelected] = useState<HabitWithStats | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleConfirm() {
    if (!selected) return
    await fetch("/api/log-habit-now", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit_id: selected.habit.id }),
    })
    setSelected(null)
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
        {habits.map(({ habit, todayCount, heatmap }) => (
          <Card
            key={habit.id}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setSelected({ habit, todayCount, heatmap })}
          >
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-1">
                <span className="font-semibold text-sm leading-tight">{habit.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {todayCount}{habit.unit}
                </span>
              </div>
              <HabitMiniHeatmap logs={heatmap} />
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <HabitLogConfirmDialog
          habitName={selected.habit.name}
          open={!!selected}
          onOpenChange={(o) => { if (!o) setSelected(null) }}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}
