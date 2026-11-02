import { headers } from 'next/headers'
import { nonceHeader } from './security-headers'

/** The nonce of this page's Content-Security-Policy (src/proxy.ts), for our inline scripts. */
export async function requestNonce(): Promise<string | undefined> {
  return (await headers()).get(nonceHeader) ?? undefined
}
