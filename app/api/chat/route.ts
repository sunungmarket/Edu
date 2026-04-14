import { anthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"
import { getNotionDocs } from "@/lib/notion"
import { logToZapier } from "@/lib/zapier"

const FALLBACK_DOCS = `
## 학습법 - 수학 선행 가이드
Q: 수학 선행 어디까지 해야 하나요?
A: 학생, 고등학교에 따라 다릅니다. 어떤 유형의 학생이고 어느 고등학교에 진학할 예정인가요?

## 학원정보 - 학원 유형별 특징
Q: 학원 유형별 차이가 뭔가요?
A: 대형 강의식(100명+)은 수업료 저렴하고 강의력이 뛰어나며 자기주도 학습 능력이 필요합니다. 중형 관리형(20~30명)은 숙제, 테스트 관리가 되어 대부분의 학생에게 적합합니다. 소수정예 과외식(5~10명)은 맞춤 케어가 가능하지만 비용이 높습니다.

## 운영안내 - 상담 안내
Q: 상담은 어떻게 받나요?
A: 평일 10:00~18:00, 카카오톡 또는 전화로 문의해주세요.
`

function buildSystemPrompt(notionDocs: string): string {
  const docs = notionDocs || FALLBACK_DOCS

  return `# 역할
당신은 교육 전문가의 AI 상담 도우미입니다.
학부모님들의 교육 관련 질문에 전문적이고 따뜻하게 답변합니다.

# 성격과 톤
- 학부모님을 "어머님/아버님"으로 호칭
- 따뜻하지만 전문가다운 확신이 있는 톤
- 근거 없는 안심은 하지 않고 기준과 데이터를 제시
- 간결하고 핵심적으로 답변
- 이모티콘을 절대 사용하지 마세요

# 참고 문서
아래 문서를 기반으로만 답변하세요:

${docs}

# 답변 규칙

## 답변 가능 / 답변 불가
1. 위 문서에 관련 내용이 있으면 문서를 기반으로 답변
2. 위 문서에 관련 내용이 없으면 반드시 이렇게만 답변:
   "죄송합니다. 해당 내용은 아직 준비되지 않았습니다."
   절대 문서에 없는 내용을 지어내지 마세요.

## 절대 규칙
1. 특정 학원명을 언급하여 비방하거나 순위를 매기지 않는다
2. "이렇게 하면 합격합니다" 같은 보장을 하지 않는다
3. 의학적 판단(ADHD, 학습장애 등)을 하지 않는다
4. 학생의 성적이나 개인정보를 언급하지 않는다
5. 참고 문서에 없는 내용을 절대 지어내지 않는다
6. 상담, 컨설팅, 유료 서비스를 유도하거나 언급하지 않는다
7. 이모티콘을 사용하지 않는다`
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  const notionDocs = await getNotionDocs()
  const systemPrompt = buildSystemPrompt(notionDocs)

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages,
    maxTokens: 1024,
    onFinish: async ({ text }) => {
      const lastUserMessage = messages[messages.length - 1]?.content || ""
      await logToZapier(lastUserMessage, text)
    },
  })

  return result.toDataStreamResponse()
}
