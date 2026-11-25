// Apart from src/lib/files.ts, which needs the server: the admin's browser code reads this.

/** A file's address on the site, without the host: it stays right when the domain changes. */
export function fileAddress(filename: string): string {
  return `/api/files/file/${encodeURIComponent(filename)}`
}
