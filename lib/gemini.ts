import { GoogleGenerativeAI } from "@google/generative-ai"
import { ParseResultSchema, type ParseResult, type Habit, type Category } from "./schemas"
import { nowKSTIso } from "./time"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["todo", "habit_log", "habit_suggestion", "unknown"],
    },
    data: { type: "object" },
    reason: { type: "string" },
  },
  required: ["type"],
}

function buildSystemPrompt(habits: Habit[], categories: Category[], nowIso: string): string {
  return `
당신은 개인 일정/습관 트래커 앱의 자연어 파서입니다.
현재 시각(Asia/Seoul): ${nowIso}

## 등록된 습관 목록
${JSON.stringify(habits.map((h) => ({ id: h.id, name: h.name, aliases: h.aliases, unit: h.unit })))}

## 등록된 카테고리 목록
${JSON.stringify(categories.map((c) => ({ id: c.id, name: c.name })))}

## 분류 규칙

### 할일(todo)
- "~해야 해", "~할 것", "~까지 마감", "~예약", "~미팅" 등 → todo
- due_date: "이번달까지"=이번달 말일 23:59, "오늘"=오늘 23:59, "내일"=내일 23:59 (Asia/Seoul)
- priority: 1=낮음, 2=중간, 3=높음 (명시 없으면 생략)

### 습관 기록(habit_log)
- 등록된 습관의 name 또는 aliases와 의미상 일치하는 경우 (한↔영, 동의어, 부분표현 허용)
  예: "술 마셨어" / "맥주" / "drinking" → name="음주" 인 습관과 매칭
- matched_term: 사용자가 실제로 쓴 표현 (aliases 자동 학습에 활용됨)
- amount: 명시된 수량, 없으면 1
- logged_at: 명시된 시각. "방금"=now, "어제 저녁"=어제 19:00, 없으면 now (모두 Asia/Seoul)

### 습관 제안(habit_suggestion)
- 습관과 관련된 표현이지만 등록된 습관과 매칭되지 않을 때
- 절대로 자동으로 습관을 만들지 말 것. habit_suggestion 반환 후 사용자 확인 대기

### 알 수 없음(unknown)
- 위 어느 것에도 해당하지 않는 경우

## 출력 형식 (JSON)
todo:
{ "type": "todo", "data": { "title": "...", "description": "...(optional)", "due_date": "ISO8601(optional)", "category_hint": "...(optional)", "priority": 1|2|3(optional) } }

habit_log:
{ "type": "habit_log", "data": { "habit_id": "uuid", "matched_term": "사용자 표현", "amount": 숫자, "logged_at": "ISO8601", "note": "...(optional)" } }

habit_suggestion:
{ "type": "habit_suggestion", "data": { "suggested_name": "...", "suggested_unit": "회|개|잔|분|개비 등", "inferred_amount": 숫자, "inferred_logged_at": "ISO8601" } }

unknown:
{ "type": "unknown", "reason": "이해하지 못한 이유" }
`.trim()
}

export async function parseUserInput(
  text: string,
  habits: Habit[],
  categories: Category[]
): Promise<ParseResult> {
  const nowIso = nowKSTIso()
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA as never,
    },
    systemInstruction: buildSystemPrompt(habits, categories, nowIso),
  })

  const result = await model.generateContent(text)
  const raw = JSON.parse(result.response.text())
  return ParseResultSchema.parse(raw)
}
