import type { Access, CollectionConfig } from 'payload'
import { revalidateCourse } from '../lib/catalogue-cache'

const publicOrAdmin: Access = ({ req }) =>
  req.user?.collection === 'admins' ? true : { _status: { equals: 'published' } }

export const Courses: CollectionConfig = {
  slug: 'courses',
  access: {
    read: publicOrAdmin,
  },
  admin: {
    group: 'Training Catalogue',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', '_status', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        revalidateCourse(doc, previousDoc)
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidateCourse(doc)
        return doc
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'slug', useAsSlug: 'title' },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'course-categories',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'subcategory',
      type: 'relationship',
      relationTo: 'course-categories',
      admin: { position: 'sidebar' },
    },
    { name: 'code', type: 'text', admin: { position: 'sidebar' } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'not-currently-scheduled',
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Currently available', value: 'currently-available' },
        { label: 'Fully booked', value: 'fully-booked' },
        { label: 'Not currently scheduled', value: 'not-currently-scheduled' },
        { label: 'Customized training available', value: 'customized-training-available' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'migrationStatus',
      type: 'select',
      required: true,
      defaultValue: 'successfully-migrated',
      options: [
        { label: 'Successfully migrated', value: 'successfully-migrated' },
        { label: 'Partially migrated', value: 'partially-migrated' },
        { label: 'Not found', value: 'not-found' },
        { label: 'Unavailable from source', value: 'source-unavailable' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'sourceUrl', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'overview', type: 'textarea' },
    {
      name: 'whyChoose',
      type: 'array',
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'objectives',
      type: 'array',
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'learningOutcomes',
      type: 'array',
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'audience',
      type: 'array',
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'prerequisites',
      type: 'array',
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'deliveryApproach',
      type: 'array',
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    { name: 'syllabus', type: 'textarea' },
    {
      name: 'organisationalImpact',
      type: 'array',
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'personalImpact',
      type: 'array',
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    { name: 'assessmentAndCertification', type: 'textarea' },
    {
      name: 'generalNotes',
      type: 'array',
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'formats',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Classroom', value: 'classroom' },
        { label: 'Live online', value: 'live-online' },
        { label: 'In-house', value: 'in-house' },
        { label: 'Customized', value: 'customized' },
      ],
    },
    {
      name: 'schedules',
      type: 'array',
      fields: [
        { name: 'dates', type: 'text', required: true },
        { name: 'startDate', type: 'date' },
        { name: 'endDate', type: 'date' },
        { name: 'venue', type: 'text', required: true },
        { name: 'duration', type: 'text' },
        { name: 'fee', type: 'text' },
        { name: 'code', type: 'text' },
        { name: 'scope', type: 'text' },
        { name: 'quarter', type: 'text' },
        { name: 'format', type: 'select', options: ['Classroom', 'Live Online'] },
      ],
    },
    { name: 'brochureUrl', type: 'text' },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea', maxLength: 320 },
      ],
    },
  ],
}
