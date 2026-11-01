import type { TaskConfig } from 'payload'

// Retention (docs/cms-schema.md § 6): every night, inquiries older than a year that didn't lead
// to a contract are deleted with their files. Only the count is logged, never personal data.

export const retentionDays = 365

export function retentionCutoff(now = new Date()): string {
  return new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000).toISOString()
}

export const deleteExpiredInquiries: TaskConfig<{ input: object; output: { deleted: number } }> = {
  slug: 'deleteExpiredInquiries',
  schedule: [{ cron: '0 3 * * *', queue: 'nightly' }],
  handler: async ({ req }) => {
    const { docs } = await req.payload.find({
      collection: 'inquiries',
      where: {
        and: [
          { createdAt: { less_than: retentionCutoff() } },
          { status: { not_equals: 'contract' } },
        ],
      },
      depth: 0,
      pagination: false,
      req,
      overrideAccess: true,
    })
    const files = docs.flatMap((inquiry) =>
      (inquiry.files ?? []).map((file) => (typeof file === 'object' ? file.id : file)),
    )
    if (docs.length > 0) {
      await req.payload.delete({
        collection: 'inquiries',
        where: { id: { in: docs.map((inquiry) => inquiry.id) } },
        req,
        overrideAccess: true,
      })
    }
    if (files.length > 0) {
      await req.payload.delete({
        collection: 'inquiry-files',
        where: { id: { in: files } },
        req,
        overrideAccess: true,
      })
    }
    req.payload.logger.info(`Retention: deleted ${docs.length} inquiries, ${files.length} files.`)
    return { output: { deleted: docs.length } }
  },
}
