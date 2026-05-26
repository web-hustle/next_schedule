"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChatMessages } from "@/components/chat-messages"
import { ChatInput } from "@/components/chat-input"
import { ChevronLeft } from "lucide-react"
import type { ChatMessage } from "@/lib/schemas"

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/history")
      const data: ChatMessage[] = await res.json()
      setMessages(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadHistory() }, [loadHistory])

  async function handleSend(text: string) {
    // Optimistically add user bubble
    const tempId = `temp-${Date.now()}`
    const optimistic: ChatMessage = {
      id: tempId,
      user_id: "",
      role: "user",
      content: text,
      meta: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()

      if (!res.ok || !data.user_msg) {
        // Replace optimistic with error message
        const errMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          user_id: "",
          role: "assistant",
          content: "오류가 발생했어요. 잠시 후 다시 시도해주세요.",
          meta: null,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => prev.filter((m) => m.id !== tempId).concat(errMsg))
        return
      }

      setMessages((prev) => {
        const without = prev.filter((m) => m.id !== tempId)
        return [...without, data.user_msg, data.assistant_msg]
      })
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    }
  }

  function handleNewMessage(msg: ChatMessage) {
    setMessages((prev) => [...prev, msg])
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3 shrink-0">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="font-semibold">채팅</h1>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        </div>
      ) : (
        <ChatMessages messages={messages} onNewMessage={handleNewMessage} />
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  )
}
