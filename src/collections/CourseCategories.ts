import type { Access, CollectionConfig } from 'payload'
import { revalidateCategory } from '../lib/catalogue-cache'

const publicOrAdmin: Access = ({ req }) =>
  req.user?.collection === 'admins' ? true : { _status: { equals: 'published' } }

export const CourseCategories: CollectionConfig = {
  slug: 'course-categories',
  access: {
    read: publicOrAdmin,
  },
  admin: {
    group: 'Training Catalogue',
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', '_status', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        revalidateCategory(doc, previousDoc)
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidateCategory(doc)
        return doc
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'slug', useAsSlug: 'name' },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'course-categories',
      admin: { position: 'sidebar' },
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { position: 'sidebar' },
    },
    { name: 'sourceUrl', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'migrationStatus',
      type: 'select',
      defaultValue: 'successfully-migrated',
      options: [
        { label: 'Successfully migrated', value: 'successfully-migrated' },
        { label: 'Partially migrated', value: 'partially-migrated' },
        { label: 'Not found', value: 'not-found' },
        { label: 'Unavailable from source', value: 'source-unavailable' },
      ],
      admin: { position: 'sidebar' },
    },
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
