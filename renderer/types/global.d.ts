export {}

declare global {
  interface Window {
    electronAPI: {
      selectFolder: () => Promise<string | null>
      getSpecialFolders: () => Promise<
        Array<{
          type: 'desktop' | 'downloads' | 'documents' | 'pictures' | 'music' | 'videos'
          path: string
        }>
      >
      openLocation: (targetPath: string) => Promise<void>
      getMediaFiles: (folders: string[]) => Promise<
        Array<{
          name: string
          path: string
          type: 'image' | 'video' | 'audio'
          folder: string
          date: string
        }>
      >
      getFolderSummaries: (folders: string[]) => Promise<
        Array<{
          path: string
          exists: boolean
          fileCount: number
          yearRange: string | null
        }>
      >
      onUpdateDownloadProgress: (listener: (percent: number) => void) => () => void
    }
  }
}