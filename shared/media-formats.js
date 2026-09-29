export const MEDIA_FORMATS = {
  image: ['.jpg', '.jpeg', '.png', '.apng', '.gif', '.webp', '.avif', '.bmp', '.svg'],
  video: ['.mp4', '.webm', '.ogv', '.mov', '.m4v'],
  audio: ['.mp3', '.wav', '.ogg', '.oga', '.flac', '.aac', '.m4a', '.opus'],
}

export function getMediaType(fileName) {
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
  if (MEDIA_FORMATS.image.includes(extension)) return 'image'
  if (MEDIA_FORMATS.video.includes(extension)) return 'video'
  if (MEDIA_FORMATS.audio.includes(extension)) return 'audio'
  return null
}
