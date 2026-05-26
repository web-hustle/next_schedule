"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import type { ChatMessage } from "@/lib/schemas"

interface Props {
  messageId: string
  suggestedName: string
  onConfirmed: (confirmMsg: ChatMessage) => void
}

export function HabitSuggestionAction({ messageId, suggestedName, onConfirmed }: Props) {
  const [answered, setAnswered] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleYes() {
    startTransition(async () => {
      const res = await fetch("/api/confirm-habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: messageId }),
      })
      const data = await res.json()
      setAnswered(true)
      onConfirmed(data.confirm_msg)
    })
  }

  function handleNo() {
    setAnswered(true)
  }

  if (answered) return null

  return (
    <div className="flex gap-2 mt-2">
      <Button size="sm" onClick={handleYes} disabled={isPending}>
        {isPending ? "처리 중..." : "예"}
      </Button>
      <Button size="sm" variant="outline" onClick={handleNo} disabled={isPending}>
        아니오
      </Button>
    </div>
  )
}
