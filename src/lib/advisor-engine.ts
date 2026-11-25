import 'server-only'

import {
  getPublicCategories,
  getPublicCourses,
  type CatalogueCategory,
  type CatalogueCourse,
} from '@/lib/catalogue'

export type ChatMessage = {
  role: 'assistant' | 'user'
  content: string
}

export const ELEVORIS_COMPANY_PROFILE = {
  name: 'Elevoris',
  tagline: 'Empowering professionals. Elevating performance.',
  overview:
    'Elevoris is a global training and consulting firm delivering practitioner-led professional development and corporate training worldwide.',
  qualityStandard: 'ISO 9001:2015 quality management certified',
  maxDelegates: 12,
  postProgrammeSupportDays: 30,
  deliveryFormats: [
    'Classroom',
    'Live Online',
    'In-House Training',
    'Tailored Corporate Programmes',
  ],
  email: 'info@elevoris.com',
  whatsappUrl: 'https://wa.me/447405900092',
  phoneDisplay: '+44 7405 900 092',
  inquiryPath: '/inquiry',
  applicationPath: '/apply',
  termsPath: '/terms-and-conditions',
  termsStatus:
    'For the current Elevoris Terms and Conditions, please contact our team for the official document.',
} as const

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'what',
  'which',
  'where',
  'when',
  'who',
  'how',
  'are',
  'can',
  'you',
  'your',
  'about',
  'from',
  'have',
  'has',
  'does',
  'tell',
  'need',
  'want',
  'looking',
  'would',
  'like',
  'could',
  'please',
  'help',
  'find',
  'recommend',
  'course',
  'courses',
  'training',
  'programme',
  'programmes',
  'program',
  'programs',
  'elevoris',
  'more',
  'details',
  'info',
  'information',
  'show',
  'give',
  'any',
  'all',
  'best',
  'good',
  'there',
  'their',
  'they',
  'them',
  'these',
  'those',
])

const SYNONYMS: Record<string, string[]> = {
  ai: ['artificial', 'intelligence', 'analytics', 'data', 'machine', 'learning', 'generative'],
  finance: [
    'financial',
    'accounting',
    'budgeting',
    'treasury',
    'banking',
    'fintech',
    'audit',
    'credit',
  ],
  hr: ['human', 'resources', 'people', 'talent', 'workforce', 'employee'],
  oil: ['gas', 'energy', 'petroleum', 'refining', 'upstream', 'downstream', 'lng'],
  energy: ['oil', 'gas', 'power', 'renewable', 'sustainability', 'esg'],
  leadership: ['executive', 'management', 'manager', 'director', 'strategy', 'strategic', 'leader'],
  procurement: [
    'supply',
    'chain',
    'purchasing',
    'sourcing',
    'vendor',
    'contract',
    'contracts',
    'logistics',
  ],
  contracts: ['contract', 'legal', 'procurement', 'fidic', 'claims', 'negotiation'],
  risk: ['compliance', 'governance', 'audit', 'forensic', 'fraud', 'regulation', 'aml'],
  online: ['live', 'virtual', 'remote', 'digital'],
  corporate: ['in-house', 'tailored', 'bespoke', 'team', 'organisation', 'organization', 'company'],
  project: ['pmo', 'pmp', 'delivery', 'planning', 'agile'],
  communication: ['presentation', 'negotiation', 'stakeholder', 'public', 'speaking', 'diplomacy'],
}

export function tokenize(value: string): string[] {
  const raw = value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word))

  const expanded = new Set<string>(raw)
  for (const token of raw) {
    const extra = SYNONYMS[token]
    if (extra) {
      for (const word of extra) expanded.add(word)
    }
  }
  return [...expanded]
}

function getCourseCategoryName(course: CatalogueCourse): string {
  return course.category && typeof course.category === 'object'
    ? course.category.name
    : 'Professional Training'
}

function buildCourseSearchHaystack(course: CatalogueCourse): string {
  const category = getCourseCategoryName(course)
  const list = (items: Array<{ text: string }> | null | undefined) =>
    (items ?? []).map((item) => item.text).join(' ')
  return [
    course.title,
    category,
    course.overview,
    list(course.whyChoose),
    list(course.objectives),
    list(course.learningOutcomes),
    list(course.audience),
    list(course.deliveryApproach),
    course.syllabus,
    (course.schedules ?? [])
      .map((s) => `${s.venue} ${s.dates} ${s.duration || ''} ${s.format || ''} ${s.code || ''}`)
      .join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function findRelevantCourses(
  courses: CatalogueCourse[],
  messages: ChatMessage[],
  limit = 8,
): { matches: CatalogueCourse[]; detectedLocation: string | null; detectedFormat: string | null } {
  const latestUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
  const recentHistory = messages
    .slice(-6)
    .map((m) => m.content)
    .join(' ')

  const allLocations = [
    ...new Set(
      courses.flatMap((c) => (c.schedules ?? []).map((s) => s.venue.trim()).filter(Boolean)),
    ),
  ]

  const lowerLatest = latestUser.toLowerCase()
  const lowerHistory = recentHistory.toLowerCase()

  const detectedLocation =
    allLocations.find((loc) => lowerLatest.includes(loc.toLowerCase())) ??
    allLocations.find((loc) => lowerHistory.includes(loc.toLowerCase())) ??
    null

  const wantsOnline =
    /\b(online|virtual|remote|live online|live\/online)\b/i.test(lowerLatest) ||
    (/\b(online|virtual|remote)\b/i.test(lowerHistory) &&
      !/\b(classroom|in-person|dubai|london|paris|riyadh|kuala lumpur)\b/i.test(lowerLatest))

  const wantsClassroom = /\b(classroom|in-person|face to face|face-to-face)\b/i.test(lowerLatest)
  const detectedFormat = wantsOnline ? 'Live Online' : wantsClassroom ? 'Classroom' : null

  const latestTokens = tokenize(latestUser)
  const historyTokens = tokenize(recentHistory)

  // Boost courses explicitly mentioned in assistant's previous message if user asks a follow-up
  const previousAssistant = [...messages].reverse().find((m) => m.role === 'assistant')?.content
  const previouslyReferencedSlugs = new Set<string>()
  if (previousAssistant) {
    for (const c of courses) {
      if (
        previousAssistant.includes(`/courses/${c.slug}`) ||
        previousAssistant.toLowerCase().includes(c.title.toLowerCase())
      ) {
        previouslyReferencedSlugs.add(c.slug)
      }
    }
  }

  const isFollowUp =
    /\b(first|second|third|fourth|this|that|those|them|these|options|ones|more|syllabus|schedule|schedules|dates|price|fee|cost|duration|durations|when|where|compare|which one|any of those|which of)\b/i.test(
      lowerLatest,
    ) ||
    (previouslyReferencedSlugs.size > 0 && latestTokens.length <= 4)

  const scored = courses.map((course) => {
    const haystack = buildCourseSearchHaystack(course)
    const titleLower = course.title.toLowerCase()
    const categoryLower = getCourseCategoryName(course).toLowerCase()
    const venuesLower = (course.schedules ?? []).map((s) => s.venue.toLowerCase())

    let score = 0

    if (titleLower.includes(lowerLatest) && lowerLatest.length > 3) score += 35

    for (const token of latestTokens) {
      if (titleLower.includes(token)) score += 10
      else if (categoryLower.includes(token)) score += 7
      else if (haystack.includes(token)) score += 2
    }

    for (const token of historyTokens) {
      if (!latestTokens.includes(token)) {
        if (titleLower.includes(token)) score += 3
        else if (categoryLower.includes(token)) score += 2
        else if (haystack.includes(token)) score += 0.5
      }
    }

    if (detectedLocation) {
      const hasLoc = venuesLower.some((v) => v.includes(detectedLocation.toLowerCase()))
      if (hasLoc) score += 12
      else if (latestTokens.length <= 2) score -= 4
    }

    if (detectedFormat === 'Live Online') {
      const hasOnline = (course.schedules ?? []).some((s) =>
        s.venue.toLowerCase().includes('online'),
      )
      if (hasOnline) score += 8
    }

    if (isFollowUp && previouslyReferencedSlugs.has(course.slug)) {
      score += 60
    }

    return { course, score }
  })

  const filtered = scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.course)

  return { matches: filtered, detectedLocation, detectedFormat }
}

export function formatCourseContext(course: CatalogueCourse): string {
  const category = getCourseCategoryName(course)
  const schedules = (course.schedules ?? [])
    .map(
      (s) =>
        `  - ${s.dates} | Venue: ${s.venue} | Format: ${s.format || 'Classroom'} | Duration: ${s.duration || 'Contact us'} | Fee: ${s.fee || 'Request a Quote'}${s.code ? ` | Code: ${s.code}` : ''}`,
    )
    .join('\n')

  const list = (items: Array<{ text: string }> | null | undefined) =>
    (items ?? []).map((item) => `  - ${item.text}`).join('\n')

  const syllabus = course.syllabus || 'Please contact our team for further information.'

  return [
    `TITLE: ${course.title}`,
    `URL: /courses/${course.slug}`,
    `CATEGORY: ${category}`,
    `STATUS: ${course.status}`,
    `OVERVIEW: ${course.overview || 'Please contact our team for further information.'}`,
    course.whyChoose?.length ? `WHY CHOOSE THIS COURSE:\n${list(course.whyChoose)}` : null,
    course.audience?.length ? `WHO SHOULD ATTEND:\n${list(course.audience)}` : null,
    course.objectives?.length ? `OBJECTIVES:\n${list(course.objectives)}` : null,
    course.learningOutcomes?.length ? `LEARNING OUTCOMES:\n${list(course.learningOutcomes)}` : null,
    course.deliveryApproach?.length ? `DELIVERY APPROACH:\n${list(course.deliveryApproach)}` : null,
    course.prerequisites?.length ? `PREREQUISITES:\n${list(course.prerequisites)}` : null,
    `SCHEDULES (${(course.schedules ?? []).length} verified):\n${schedules || '  - No verified public schedule'}`,
    `COMPLETE SYLLABUS:\n${syllabus}`,
    course.organisationalImpact?.length
      ? `ORGANISATIONAL IMPACT:\n${list(course.organisationalImpact)}`
      : null,
    course.personalImpact?.length ? `PERSONAL IMPACT:\n${list(course.personalImpact)}` : null,
    course.assessmentAndCertification
      ? `ASSESSMENT AND CERTIFICATION:\n${course.assessmentAndCertification}`
      : null,
    course.generalNotes?.length ? `GENERAL NOTES:\n${list(course.generalNotes)}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export function buildCatalogueOverview(
  courses: CatalogueCourse[],
  categories: CatalogueCategory[],
): string {
  const countByCat = new Map<string, number>()
  for (const c of courses) {
    const name = getCourseCategoryName(c)
    countByCat.set(name, (countByCat.get(name) || 0) + 1)
  }

  const locations = [
    ...new Set(
      courses.flatMap((c) => (c.schedules ?? []).map((s) => s.venue.trim()).filter(Boolean)),
    ),
  ].sort()

  const categoryLines = categories
    .map(
      (cat) => `- ${cat.name} (/categories/${cat.slug}): ${countByCat.get(cat.name) || 0} courses`,
    )
    .join('\n')

  const compactIndex = courses
    .map((c) => {
      const venues = [...new Set((c.schedules ?? []).map((s) => s.venue).filter(Boolean))].join(
        ', ',
      )
      const durations = [
        ...new Set((c.schedules ?? []).map((s) => s.duration).filter(Boolean)),
      ].join(', ')
      return `- ${c.title} | ${getCourseCategoryName(c)} | /courses/${c.slug} | Venues: ${venues || 'On request'}${durations ? ` | Durations: ${durations}` : ''}`
    })
    .join('\n')

  return `ELEVORIS COMPANY PROFILE:
- Name: ${ELEVORIS_COMPANY_PROFILE.name} — "${ELEVORIS_COMPANY_PROFILE.tagline}"
- Overview: ${ELEVORIS_COMPANY_PROFILE.overview}
- Quality Certification: ${ELEVORIS_COMPANY_PROFILE.qualityStandard}
- Cohort Size: Maximum ${ELEVORIS_COMPANY_PROFILE.maxDelegates} delegates per cohort
- Post-Programme Support: ${ELEVORIS_COMPANY_PROFILE.postProgrammeSupportDays} days of facilitator support included
- Delivery Formats: ${ELEVORIS_COMPANY_PROFILE.deliveryFormats.join(', ')}
- Contact: Email ${ELEVORIS_COMPANY_PROFILE.email} | WhatsApp ${ELEVORIS_COMPANY_PROFILE.whatsappUrl} | Enquiry Form: /inquiry
- Registration: Choose a verified session on a course page, then use ${ELEVORIS_COMPANY_PROFILE.applicationPath}
- Terms and Conditions: ${ELEVORIS_COMPANY_PROFILE.termsStatus} Availability notice: ${ELEVORIS_COMPANY_PROFILE.termsPath}

ALL ${categories.length} COURSE CATEGORIES:
${categoryLines}

AVAILABLE TRAINING DESTINATIONS (${locations.length}):
${locations.join(', ')}

COMPLETE VERIFIED CATALOGUE INDEX (${courses.length} COURSES):
${compactIndex}`
}

export async function buildSmartFallbackAnswer(messages: ChatMessage[]): Promise<string> {
  const [courses, categories] = await Promise.all([getPublicCourses(), getPublicCategories()])
  const latest = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
  const lower = latest.toLowerCase()
  const isGreeting =
    /^(hello|hi|hey|good morning|good afternoon|good evening|greetings|how are you)[!,.?\s]*$/i.test(
      latest.trim(),
    )
  const isThanks = /^(thank you|thanks|many thanks|thank you very much)[!,.?\s]*$/i.test(
    latest.trim(),
  )
  const isTermsQuestion = /\b(terms|conditions|legal|privacy|policy|policies)\b/i.test(lower)
  const isRegistrationQuestion =
    /\b(apply|application|register|registration|enrol|enroll|book|booking|sign up)\b/i.test(lower)
  const isAboutCompany =
    /\b(what is elevoris|who is elevoris|tell me about elevoris|about elevoris|who are you)\b/i.test(
      lower,
    )

  const isCompanyQuestion =
    /\b(elevoris|about|who are you|quality|iso|cohort|support|corporate|in-house|in house|bespoke|tailored|customized|customised|contact|email|whatsapp|enquiry|inquiry|proposal|quote|price|pricing)\b/i.test(
      lower,
    )

  const isCategoriesQuestion =
    /\b(categories|category|subjects|topics|areas|departments|what do you teach|what courses do you offer)\b/i.test(
      lower,
    )

  const isLocationListQuestion =
    /\b(where|locations|cities|countries|destinations|venues)\b/i.test(lower) &&
    !/\b(in|at)\s+(london|dubai|paris|riyadh|jeddah|kuala lumpur|kigali|accra|vienna|manchester|nairobi|amsterdam|male|online)\b/i.test(
      lower,
    )

  const { matches, detectedLocation, detectedFormat } = findRelevantCourses(courses, messages, 5)

  if (isGreeting) {
    const greeting = /\bgood morning\b/i.test(lower)
      ? 'Good morning'
      : /\bgood afternoon\b/i.test(lower)
        ? 'Good afternoon'
        : /\bgood evening\b/i.test(lower)
          ? 'Good evening'
          : 'Hello'
    return `${greeting} — welcome to Elevoris. I’m here to help with course recommendations, schedules, fees, locations, registration, corporate training, or general questions about Elevoris. What would you like help with?`
  }

  if (isThanks) {
    return `You’re very welcome. If you need anything else, I can help compare programmes, check verified schedules and fees, explain registration, or connect you with the Elevoris team.`
  }

  if (isTermsQuestion) {
    return `${ELEVORIS_COMPANY_PROFILE.termsStatus}\n\nSee the [official availability notice](${ELEVORIS_COMPANY_PROFILE.termsPath}) or contact **${ELEVORIS_COMPANY_PROFILE.email}** for the current official document.`
  }

  if (isRegistrationQuestion) {
    return `To apply, open a course page, choose a verified scheduled session where available, and select **Apply for Course**. The application will be pre-filled with that course and session.\n\nYou can also start at [Course Application](${ELEVORIS_COMPANY_PROFILE.applicationPath}), [browse all courses](/courses), or contact **${ELEVORIS_COMPANY_PROFILE.email}** for assistance.`
  }

  if (isAboutCompany) {
    return `**About Elevoris**\n\n${ELEVORIS_COMPANY_PROFILE.overview}\n\n• **Quality assured:** ${ELEVORIS_COMPANY_PROFILE.qualityStandard}\n• **Focused cohorts:** Maximum ${ELEVORIS_COMPANY_PROFILE.maxDelegates} delegates per session\n• **Delivery formats:** ${ELEVORIS_COMPANY_PROFILE.deliveryFormats.join(', ')}\n\nExplore [training solutions](/training-solutions), [all courses](/courses), or [contact Elevoris](/contact).`
  }

  if (isCategoriesQuestion && matches.length === 0) {
    const catList = categories
      .map((cat) => {
        const count = courses.filter((c) => getCourseCategoryName(c) === cat.name).length
        return `• [${cat.name}](/categories/${cat.slug}) (${count} ${count === 1 ? 'programme' : 'programmes'})`
      })
      .join('\n')
    return `Elevoris offers programmes across **${categories.length} professional categories** (${courses.length} verified courses):\n\n${catList}\n\nTell me your role, topic, or preferred city (e.g. Dubai, London, Live Online) and I will recommend specific programmes.`
  }

  if (isLocationListQuestion && matches.length === 0) {
    const venues = [
      ...new Set(courses.flatMap((c) => (c.schedules ?? []).map((s) => s.venue.trim()))),
    ].sort()
    return `Elevoris delivers verified classroom schedules in **${venues.filter((v) => v.toLowerCase() !== 'live/online').join(', ')}**, plus **Live/Online** digital classrooms and **in-house / bespoke corporate delivery** worldwide.\n\nBrowse all venues at [Locations](/locations) or ask me for courses in a specific city.`
  }

  if (isCompanyQuestion && matches.length === 0) {
    return `**About Elevoris & Training Solutions**\n\n• **Quality assured:** ${ELEVORIS_COMPANY_PROFILE.qualityStandard}\n• **Focused cohorts:** Maximum ${ELEVORIS_COMPANY_PROFILE.maxDelegates} delegates per session\n• **Ongoing support:** ${ELEVORIS_COMPANY_PROFILE.postProgrammeSupportDays} days of post-programme facilitator support\n• **Delivery formats:** Classroom, Live Online, In-House, and Tailored Corporate Programmes\n\nFor confirmed pricing, corporate proposals, or bespoke team programmes:\n• Submit an [International Training Inquiry](/inquiry)\n• Email **${ELEVORIS_COMPANY_PROFILE.email}**\n• Message us on [WhatsApp](${ELEVORIS_COMPANY_PROFILE.whatsappUrl})`
  }

  if (matches.length > 0) {
    const introParts: string[] = []
    if (detectedLocation) introParts.push(`in **${detectedLocation}**`)
    if (detectedFormat) introParts.push(`via **${detectedFormat}**`)
    const filterNote = introParts.length ? ` (${introParts.join(' · ')})` : ''

    const formatted = matches.slice(0, 4).map((course) => {
      const cat = getCourseCategoryName(course)
      const matchingSchedule =
        (course.schedules ?? []).find((s) => {
          const locOk =
            !detectedLocation || s.venue.toLowerCase().includes(detectedLocation.toLowerCase())
          const fmtOk =
            !detectedFormat || (s.format || '').toLowerCase() === detectedFormat.toLowerCase()
          return locOk && fmtOk
        }) ?? course.schedules?.[0]

      const scheduleLine = matchingSchedule
        ? `${matchingSchedule.dates} · ${matchingSchedule.venue} · ${matchingSchedule.duration || 'Duration on request'} · ${matchingSchedule.fee || 'Request a Quote'}`
        : 'Contact us for upcoming dates'

      return `• **[${course.title}](/courses/${course.slug})**\n  ${cat} — ${scheduleLine}`
    })

    const extraContact = isCompanyQuestion
      ? `\n\nFor tailored pricing, in-house delivery, or confirmed seats, submit an [enquiry](/inquiry) or email **${ELEVORIS_COMPANY_PROFILE.email}**.`
      : `\n\nAsk a follow-up (e.g. syllabus, other cities, or Live Online dates), or [request a proposal](/inquiry).`

    return `Here are the closest verified Elevoris programmes${filterNote}:\n\n${formatted.join('\n\n')}${extraContact}`
  }

  return `I couldn't find an exact match in the verified Elevoris catalogue for “${latest}”.\n\nTo help me narrow it down, could you share your **industry or job role**, **topic** (e.g. Leadership, Finance, AI, Oil & Gas, Procurement, Risk), and preferred **location or Live Online** format?\n\nYou can also browse all [${courses.length} programmes](/courses), explore [all ${categories.length} categories](/categories), [request a proposal](/inquiry), or email **${ELEVORIS_COMPANY_PROFILE.email}**.`
}
