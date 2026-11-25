import type { CollectionConfig } from 'payload'

export const Locations: CollectionConfig = {
  slug: 'locations',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Training Catalogue',
    useAsTitle: 'city',
    defaultColumns: ['city', 'country', 'region', 'active'],
  },
  fields: [
    { name: 'city', type: 'text', required: true },
    { name: 'country', type: 'text', required: true },
    { name: 'region', type: 'text' },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'description', type: 'textarea' },
  ],
}
