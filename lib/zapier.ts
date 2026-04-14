export async function logToZapier(question: string, answer: string) {
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL
  if (!webhookUrl) return

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        question,
        answer,
        is_unanswerable: answer.includes("아직 준비되지 않았습니다"),
      }),
    })
  } catch {
    // Logging failure should not break the chatbot
  }
}
