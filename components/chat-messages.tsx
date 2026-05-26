"use client"

import { useEffect, useRef } from "react"
import { HabitSuggestionAction } from "./habit-suggestion-action"
import type { ChatMessage } from "@/lib/schemas"

interface Props {
  messages: ChatMessage[]
  onNewMessage: (msg: ChatMessage) => void
}

export function ChatMessages({ messages, onNewMessage }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((msg) => {
        const isUser = msg.role === "user"
        const isPendingHabit = msg.meta?.pending_action === "create_habit"

        return (
          <div
            key={msg.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isUser
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              {!isUser && isPendingHabit && (
                <HabitSuggestionAction
                  messageId={msg.id}
                  suggestedName={String(msg.meta?.suggested_name ?? "")}
                  onConfirmed={onNewMessage}
                />
              )}
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
