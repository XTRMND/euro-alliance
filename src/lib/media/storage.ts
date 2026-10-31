import { readFile } from 'node:fs/promises'
import path from 'node:path'

// Uploads live on a local volume (MEDIA_DIR; /app/media in Docker). Moving to S3-compatible
// storage means adding Payload's storage plugin in payload.config.ts and reading originals from
// the bucket in readUpload; nothing else touches the disk.

// A runtime data folder, not code: keep Turbopack from tracing the whole project into the build.
const root = path.resolve(/* turbopackIgnore: true */ process.env.MEDIA_DIR ?? 'media')

export const uploadDirs = {
  media: path.join(root, 'media'),
  tints: path.join(root, 'tints'),
}

export function readUpload(dir: keyof typeof uploadDirs, filename: string): Promise<Buffer> {
  return readFile(path.join(uploadDirs[dir], filename))
}
