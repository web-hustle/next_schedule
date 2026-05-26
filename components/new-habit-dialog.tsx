"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

async function createHabit(name: string, unit: string, aliases: string[]) {
  const res = await fetch("/api/habits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, unit, aliases }),
  })
  if (!res.ok) throw new Error("Failed to create habit")
}

export function NewHabitDialog({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("")
  const [unit, setUnit] = useState("회")
  const [aliasInput, setAliasInput] = useState("")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function handleClose() {
    setName("")
    setUnit("회")
    setAliasInput("")
    setError("")
    onOpenChange(false)
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError("습관 이름을 입력해주세요.")
      return
    }
    const aliases = aliasInput
      .split(/[,，\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)

    startTransition(async () => {
      try {
        await createHabit(name.trim(), unit.trim() || "회", aliases)
        handleClose()
        onCreated()
      } catch {
        setError("저장 중 오류가 발생했어요.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 습관 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="habit-name">이름 *</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 음주, 운동, 독서"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="habit-unit">단위</Label>
            <Input
              id="habit-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="회, 잔, 개비, 분 등"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="habit-aliases">별명/동의어 (쉼표 구분)</Label>
            <Input
              id="habit-aliases"
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              placeholder="술, drinking, 맥주"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={pending}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
