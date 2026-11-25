import type { CollectionConfig } from 'payload'

import { createFolderField, createTagField } from 'payload'
import { revalidateRelatedMedia } from '../lib/catalogue-cache'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidateRelatedMedia()
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidateRelatedMedia()
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  upload: true,
}
