import 'server-only'

import { GoogleGenAI } from '@google/genai'
import { getPublicCategories, getPublicCourses } from '@/lib/catalogue'
import {
  buildCatalogueOverview,
  buildSmartFallbackAnswer,
  ELEVORIS_COMPANY_PROFILE,
  findRelevantCourses,
  formatCourseContext,
  type ChatMessage,
} from '@/lib/advisor-engine'
import { checkRateLimit, isCrossSiteRequest, readJsonObject } from '@/lib/request-security'

function validMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 14) return null
  const messages: ChatMessage[] = []
  for (const item of value) {
    if (
      !item ||
      typeof item !== 'object' ||
      !('role' in item) ||
      !('content' in item) ||
      (item.role !== 'assistant' && item.role !== 'user') ||
      typeof item.content !== 'string'
    ) {
      return null
    }
    const maxLen = item.role === 'assistant' ? 8000 : 1200
    const trimmed = item.content.trim()
    if (trimmed.length < 1 || trimmed.length > maxLen) {
      return null
    }
    messages.push({ role: item.role, content: trimmed })
  }
  return messages
}

export async function GET() {
  const [courses, categories] = await Promise.all([getPublicCourses(), getPublicCategories()])
  return Response.json({
    available: true,
    totalCourses: courses.length,
    totalCategories: categories.length,
  })
}

export async function POST(request: Request) {
  if (isCrossSiteRequest(request)) {
    return Response.json({ error: 'Cross-site requests are not allowed.' }, { status: 403 })
  }

  const rateLimit = checkRateLimit(request, 'training-advisor', 30, 60 * 1000)
  if (!rateLimit.allowed) {
    return Response.json(
      { error: 'Too many questions. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    )
  }

  const body = await readJsonObject(request, 64_000)
  const messages = body && 'messages' in body ? validMessages(body.messages) : null
  if (!messages || messages.at(-1)?.role !== 'user') {
    return Response.json({ error: 'Invalid messages.' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    const answer = await buildSmartFallbackAnswer(messages)
    return Response.json({
      answer,
    })
  }

  try {
    const [courses, categories] = await Promise.all([getPublicCourses(), getPublicCategories()])
    const catalogueOverview = buildCatalogueOverview(courses, categories)
    const { matches } = findRelevantCourses(courses, messages, 4)
    const detailedContext = matches.map(formatCourseContext).join('\n\n---\n\n')

    const systemInstruction = `You are the Elevoris AI Training Advisor — a knowledgeable, consultative training advisor for Elevoris.

RULES & GROUNDING (STRICT):
1. Use ONLY the verified Elevoris company information and course catalogue context below. NEVER invent course titles, dates, prices/fees, locations, durations, certifications, instructors, or company claims.
2. Maintain full conversation context across turns so follow-up questions (e.g., filtering previous recommendations by city/online format, asking about syllabus/audience/schedules of a previously mentioned course, or refining by role/industry) are answered accurately.
3. Recommend up to 3–4 relevant courses when advising on programmes. Format every course and page link using clean Markdown links like [Course Title](/courses/slug), [Category Name](/categories/slug), or [Request a Proposal](/inquiry).
4. Include verified schedule details (dates, venue, duration, and published fee or "Request a Quote") when available in the context. If a detail is not listed, say "Please contact our team for further information" and offer assistance via [the enquiry form](/inquiry), email (${ELEVORIS_COMPANY_PROFILE.email}), or [WhatsApp](${ELEVORIS_COMPANY_PROFILE.whatsappUrl}).
5. If the user's needs are broad or ambiguous, give helpful initial options or ask 1 concise clarifying question (about their role, industry, preferred city or Live Online format, or objectives).
6. If a user asks about something completely outside Elevoris professional training, politely explain that you specialise in Elevoris training programmes and offer to help find relevant courses or connect them with the Elevoris team.
7. Keep responses well-structured, concise, and easy to scan on mobile and desktop.
8. Respond naturally to greetings, thanks, and ordinary conversation. You are a customer assistant, not only a course search box.
9. For registration, guide visitors to choose a session on the course page and use [Course Application](/apply).
10. The current official Terms and Conditions are available on request. Never invent legal terms; direct visitors to [Terms and Conditions](/terms-and-conditions) or the Elevoris team.

${catalogueOverview}

DETAILED RECORDS FOR TOP MATCHING COURSES:
${detailedContext || 'No specific course detail matched directly; rely on the Complete Verified Catalogue Index and Company Profile above.'}`

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })

    const contents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    let responseText = ''
    let lastError: unknown = null

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction,
          },
        })
        const candidate = response.text?.trim()
        if (candidate) {
          responseText = candidate
          break
        }
      } catch (err) {
        lastError = err
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 350))
        }
      }
    }

    if (!responseText) {
      if (lastError) {
        console.error('[training-advisor] Gemini API error after retry:', lastError)
      }
      const fallback = await buildSmartFallbackAnswer(messages)
      return Response.json({
        answer: fallback,
      })
    }

    return Response.json({
      answer: responseText,
    })
  } catch (err) {
    console.error('[training-advisor] Fatal advisor error:', err)
    const fallback = await buildSmartFallbackAnswer(messages)
    return Response.json({
      answer: fallback,
    })
  }
}
