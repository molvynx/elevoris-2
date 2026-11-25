import type { Config, Inquiry } from '@/payload-types'

type CollectionSlug = keyof Config['collections']

export async function findBySlug<T extends CollectionSlug>(
  _collection: T,
  _slug: string,
  _options?: {
    draft?: boolean
    depth?: number
  },
): Promise<Config['collections'][T] | null> {
  return null
}

export async function findByField<T extends CollectionSlug>(
  _collection: T,
  _field: string,
  _value: string,
  _options?: {
    draft?: boolean
    depth?: number
  },
): Promise<Config['collections'][T] | null> {
  return null
}

type NewInquiry = Pick<
  Inquiry,
  | 'fullName'
  | 'email'
  | 'countryCode'
  | 'phone'
  | 'country'
  | 'company'
  | 'courseInterest'
  | 'preferredLocation'
  | 'participants'
  | 'currency'
  | 'budget'
  | 'message'
>

export type NewsletterSubscription = {
  id: string
  email: string
  fullName?: string
  topicInterest?: string
  createdAt: string
}

const globalStore = globalThis as typeof globalThis & {
  __elevorisInquiries?: Array<NewInquiry & { id: string; status: 'new'; createdAt: string }>
  __elevorisNewsletter?: Map<string, NewsletterSubscription>
}

const inquiryStore = globalStore.__elevorisInquiries ?? []
globalStore.__elevorisInquiries = inquiryStore

const newsletterStore = globalStore.__elevorisNewsletter ?? new Map<string, NewsletterSubscription>()
globalStore.__elevorisNewsletter = newsletterStore

// MOCKED — in-memory store replacing Figma Cloud Payload database
export async function saveInquiry(data: NewInquiry) {
  const record = {
    ...data,
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'new' as const,
    createdAt: new Date().toISOString(),
  }
  inquiryStore.push(record)
  return record
}

export async function saveNewsletterSubscription(input: {
  email: string
  fullName?: string
  topicInterest?: string
}): Promise<{ alreadySubscribed: boolean; record: NewsletterSubscription }> {
  const normalizedEmail = input.email.trim().toLowerCase()
  const existing = newsletterStore.get(normalizedEmail)
  if (existing) {
    return { alreadySubscribed: true, record: existing }
  }
  const record: NewsletterSubscription = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email: normalizedEmail,
    fullName: input.fullName?.trim() || undefined,
    topicInterest: input.topicInterest?.trim() || undefined,
    createdAt: new Date().toISOString(),
  }
  newsletterStore.set(normalizedEmail, record)
  return { alreadySubscribed: false, record }
}
