"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { HabitLogConfirmDialog } from "@/components/habit-log-confirm-dialog"
import { ChevronLeft, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Habit } from "@/lib/schemas"

interface HabitDetail {
  habit: Habit
  dailyMap: Record<string, number>
  todayCount: number
}

function toKSTDateKey(date: Date): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

export default function HabitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [detail, setDetail] = useState<HabitDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [month, setMonth] = useState(new Date())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/habits/${id}`)
      if (!res.ok) { router.push("/"); return }
      const data = await res.json()
      setDetail(data)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { load() }, [load])

  async function handleLog() {
    await fetch("/api/log-habit-now", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit_id: id }),
    })
    setConfirmOpen(false)
    load()
  }

  if (loading || !detail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    )
  }

  const { habit, dailyMap, todayCount } = detail
  const todayKey = toKSTDateKey(new Date())

  // days that have logs → used as Calendar modifiers
  const loggedDates = Object.entries(dailyMap)
    .filter(([, v]) => v > 0)
    .map(([k]) => new Date(k + "T00:00:00"))

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{habit.name}</h1>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setConfirmOpen(true)}>
            <Plus className="h-4 w-4" />
            기록
          </Button>
        </div>

        {/* 오늘 현황 */}
        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">오늘</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{todayCount}</span>
              <Badge variant="secondary">{habit.unit}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 달력 */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">날짜별 기록</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-1 pb-3">
            <Calendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              selected={undefined}
              modifiers={{ logged: loggedDates }}
              className="w-full [--cell-size:--spacing(10)]"
              classNames={{
                week: "flex w-full mt-1 gap-1",
                day: "flex-1 p-0",
              }}
              components={{
                DayButton: ({ day, modifiers, className, ...props }) => {
                  const key = toKSTDateKey(day.date)
                  const count = dailyMap[key] ?? 0
                  const isToday = key === todayKey

                  return (
                    <button
                      {...props}
                      className={cn(
                        "flex flex-col items-center justify-center w-full h-14 rounded-md select-none transition-colors",
                        "hover:bg-accent",
                        isToday && "ring-2 ring-primary ring-inset",
                        count > 0
                          ? "bg-green-100 dark:bg-green-900/40"
                          : "text-muted-foreground",
                        modifiers.outside && "opacity-25",
                        className,
                      )}
                    >
                      <span className={cn("text-sm leading-none", count > 0 && "font-semibold")}>
                        {day.date.getDate()}
                      </span>
                      {count > 0 && (
                        <span className="text-xs text-green-700 dark:text-green-400 leading-none mt-1">
                          {count}{habit.unit}
                        </span>
                      )}
                    </button>
                  )
                },
              }}
            />
          </CardContent>
        </Card>

        {/* 이번 달 기록 목록 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {month.getFullYear()}년 {month.getMonth() + 1}월 기록
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const year = month.getFullYear()
              const mon = month.getMonth()
              const daysInMonth = new Date(year, mon + 1, 0).getDate()
              const entries = Array.from({ length: daysInMonth }, (_, i) => {
                const d = new Date(year, mon, i + 1)
                const key = `${year}-${String(mon + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
                return { date: d, key, count: dailyMap[key] ?? 0 }
              }).filter((e) => e.count > 0)

              if (entries.length === 0) {
                return <p className="text-sm text-muted-foreground text-center py-2">이 달에 기록이 없어요.</p>
              }

              return (
                <ul className="divide-y max-h-64 overflow-y-auto">
                  {entries.map(({ date, count }) => (
                    <li key={date.toISOString()} className="flex items-center justify-between py-2 text-sm">
                      <span>
                        {date.getMonth() + 1}월 {date.getDate()}일{" "}
                        <span className="text-muted-foreground text-xs">
                          ({["일","월","화","수","목","금","토"][date.getDay()]})
                        </span>
                      </span>
                      <span className="font-semibold">
                        {count}
                        <span className="text-muted-foreground font-normal ml-0.5">{habit.unit}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      <HabitLogConfirmDialog
        habitName={habit.name}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleLog}
      />
    </main>
  )
}
