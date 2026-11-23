// The visitor's address, for rate limits. X-Forwarded-For is a list that every proxy adds to on
// the right, and whatever the visitor sent in it sits on the left, so the first value can be
// anything the visitor likes. The address to trust is the one the outermost proxy of ours wrote:
// counted from the right, by how many proxies stand in front of the app (TRUSTED_PROXY_HOPS,
// 1 for Caddy alone, 2 with a CDN in front of it).

export function trustedHops(value = process.env.TRUSTED_PROXY_HOPS): number {
  const hops = Number(value)
  return Number.isInteger(hops) && hops >= 1 && hops <= 10 ? hops : 1
}

export function clientIp(forwardedFor: string | null | undefined, hops = trustedHops()): string {
  const list = (forwardedFor ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  // Fewer values than proxies: a request that didn't come through them all. Take the leftmost.
  return list[Math.max(0, list.length - hops)] ?? 'unknown'
}
