"use client"

import { useChat } from "@ai-sdk/react"
import { useEffect, useRef } from "react"

const EXAMPLE_QUESTIONS = [
  "수학 선행 어디까지 해야 하나요?",
  "학원 유형별 차이가 뭔가요?",
  "수학 공부는 어떻게 해야하나요?",
]

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: "/api/chat" })

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendQuestion = (q: string) => {
    handleInputChange({ target: { value: q } } as any)
    setTimeout(() => {
      const form = document.querySelector("form")
      form?.requestSubmit()
    }, 50)
  }

  return (
    <div className="flex flex-col h-dvh max-w-2xl mx-auto">
      {/* Header */}
      <header className="px-5 py-4 border-b border-gray-100 bg-white">
        <h1 className="text-lg font-semibold text-gray-900">AI 상담 도우미</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          AI가 답변합니다. 정확한 사항은 선생님께 직접 문의해주세요.
        </p>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-400 text-sm mb-6">
              궁금하신 점을 물어보세요
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendQuestion(q)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-400">
              <span className="inline-flex gap-1">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>.</span>
                <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>.</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-gray-100 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="궁금하신 점을 입력하세요..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-30 transition-colors"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  )
}
