"use client"

import { useState, useRef, useTransition, KeyboardEvent } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface Props {
  onSend: (text: string) => Promise<void>
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("")
  const [isPending, startTransition] = useTransition()
  const isDisabled = isPending || disabled
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || isDisabled) return
    setText("")
    startTransition(async () => {
      await onSend(trimmed)
      textareaRef.current?.focus()
    })
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t bg-background px-4 py-3 flex gap-2 items-end">
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지 입력... (Enter로 전송, Shift+Enter 줄바꿈)"
        className="resize-none min-h-[44px] max-h-32 flex-1"
        rows={1}
        disabled={isDisabled}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!text.trim() || isDisabled}
        className="shrink-0 h-10 w-10"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
