// `pnpm seed`: fills in the verified company facts and offices where they're missing.
import config from '@payload-config'
import { getPayload } from 'payload'
import { seed } from '@/seed'

const payload = await getPayload({ config })
await seed(payload)
process.exit(0)
