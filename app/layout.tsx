import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI 상담 도우미",
  description: "교육 전문가 AI 상담 도우미",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-white">{children}</body>
    </html>
  )
}
