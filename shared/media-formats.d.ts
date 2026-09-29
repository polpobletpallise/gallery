export const MEDIA_FORMATS: {
  readonly image: readonly string[]
  readonly video: readonly string[]
  readonly audio: readonly string[]
}

export type MediaType = keyof typeof MEDIA_FORMATS

export function getMediaType(fileName: string): MediaType | null
