"use client"

import { useState, useTransition } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatRelativeDueDate } from "@/lib/time"
import type { Todo } from "@/lib/schemas"

interface Props {
  todos: Todo[]
  onToggle?: (todoId: string, isDone: boolean) => Promise<void>
}

export function TodoList({ todos, onToggle }: Props) {
  const [pending, startTransition] = useTransition()
  const [localDone, setLocalDone] = useState<Record<string, boolean>>({})
  const [confirm, setConfirm] = useState<Todo | null>(null)

  function handleCheckClick(todo: Todo) {
    const isDone = localDone[todo.id] ?? todo.is_done
    if (!isDone) {
      // 완료 처리할 때만 확인 다이얼로그
      setConfirm(todo)
    } else {
      // 완료 → 미완료 취소는 바로 처리
      doToggle(todo, false)
    }
  }

  function doToggle(todo: Todo, newVal: boolean) {
    setLocalDone((prev) => ({ ...prev, [todo.id]: newVal }))
    startTransition(async () => {
      await onToggle?.(todo.id, newVal)
    })
  }

  function handleConfirm() {
    if (!confirm) return
    doToggle(confirm, true)
    setConfirm(null)
  }

  if (todos.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4 text-center">
        미완료 할일이 없어요 🎉
      </p>
    )
  }

  return (
    <>
      <ul className="divide-y">
        {todos.map((todo) => {
          const isDone = localDone[todo.id] ?? todo.is_done
          const rel = formatRelativeDueDate(todo.due_date)
          return (
            <li key={todo.id} className="flex items-start gap-3 py-3">
              <Checkbox
                checked={isDone}
                onCheckedChange={() => handleCheckClick(todo)}
                disabled={pending}
                className="mt-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${isDone ? "line-through text-muted-foreground" : ""}`}>
                  {todo.title}
                </p>
                {todo.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{todo.description}</p>
                )}
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {todo.categories && (
                    <Badge
                      variant="secondary"
                      style={todo.categories.color ? { backgroundColor: todo.categories.color + "33", color: todo.categories.color } : {}}
                      className="text-xs px-1.5 py-0"
                    >
                      {todo.categories.name}
                    </Badge>
                  )}
                  {todo.priority && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {todo.priority === 3 ? "높음" : todo.priority === 2 ? "중간" : "낮음"}
                    </Badge>
                  )}
                  {rel && (
                    <span className={`text-xs ${rel === "지남" ? "text-destructive" : rel === "오늘" ? "text-orange-500" : "text-muted-foreground"}`}>
                      {rel}
                    </span>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <AlertDialog open={!!confirm} onOpenChange={(o) => { if (!o) setConfirm(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>할일 완료</AlertDialogTitle>
            <AlertDialogDescription>
              「{confirm?.title}」을(를) 완료 처리할까요?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>완료</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
