import type { Access, CollectionConfig } from 'payload'
import { revalidateBlogPost } from '../lib/catalogue-cache'

const publicOrAdmin: Access = ({ req }) =>
  req.user?.collection === 'admins' ? true : { _status: { equals: 'published' } }

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  access: {
    read: publicOrAdmin,
  },
  admin: {
    group: 'Website Content',
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'publishedAt', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        revalidateBlogPost(doc, previousDoc)
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidateBlogPost(doc)
        return doc
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'slug', useAsSlug: 'title' },
    { name: 'excerpt', type: 'textarea' },
    { name: 'content', type: 'richText', required: true },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
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
