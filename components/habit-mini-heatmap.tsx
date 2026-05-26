"use client"

interface Props {
  logs: Record<string, number> // YYYY-MM-DD -> total amount
}

// 12 weeks = 84 days, rendered as 12 cols x 7 rows
export function HabitMiniHeatmap({ logs }: Props) {
  const days: string[] = []
  const today = new Date()
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }

  const maxVal = Math.max(1, ...Object.values(logs))

  function colorClass(day: string) {
    const val = logs[day] ?? 0
    if (val === 0) return "bg-muted"
    const intensity = val / maxVal
    if (intensity < 0.25) return "bg-green-200"
    if (intensity < 0.5) return "bg-green-400"
    if (intensity < 0.75) return "bg-green-600"
    return "bg-green-800"
  }

  // 12 weeks * 7 days grid
  const weeks: string[][] = []
  for (let w = 0; w < 12; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7))
  }

  return (
    <div className="flex gap-0.5">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-0.5">
          {week.map((day) => (
            <div
              key={day}
              title={`${day}: ${logs[day] ?? 0}`}
              className={`w-2 h-2 rounded-sm ${colorClass(day)}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
