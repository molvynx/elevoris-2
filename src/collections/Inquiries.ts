import type { Access, CollectionConfig, FieldAccess } from 'payload'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'
const isPayloadAdminField: FieldAccess = ({ req }) => req.user?.collection === 'admins'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  access: {
    create: () => true,
    delete: isPayloadAdmin,
    read: isPayloadAdmin,
    update: isPayloadAdmin,
  },
  admin: {
    group: 'Customer Enquiries',
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'company', 'courseInterest', 'country', 'status', 'createdAt'],
  },
  fields: [
    { name: 'fullName', type: 'text', required: true, maxLength: 120 },
    { name: 'email', type: 'email', required: true },
    { name: 'countryCode', type: 'text', required: true, maxLength: 8 },
    { name: 'phone', type: 'text', required: true, maxLength: 30 },
    { name: 'country', type: 'text', required: true, maxLength: 100 },
    { name: 'company', type: 'text', required: true, maxLength: 160 },
    { name: 'courseInterest', type: 'text', required: true, maxLength: 180 },
    { name: 'preferredLocation', type: 'text', required: true, maxLength: 120 },
    { name: 'participants', type: 'number', required: true, min: 1, max: 500 },
    {
      name: 'currency',
      type: 'select',
      required: true,
      options: ['USD', 'GBP', 'EUR', 'AED', 'SAR'],
    },
    { name: 'budget', type: 'text', maxLength: 80 },
    { name: 'message', type: 'textarea', required: true, maxLength: 3000 },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'contacted', 'qualified', 'closed'],
      access: {
        create: isPayloadAdminField,
        update: isPayloadAdminField,
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
