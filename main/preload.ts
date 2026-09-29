import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getSpecialFolders: () => ipcRenderer.invoke('get-special-folders'),
  openLocation: (targetPath: string) => ipcRenderer.invoke('open-location', targetPath),
  getMediaFiles: (folders: string[]) => ipcRenderer.invoke('get-media-files', folders),
  getFolderSummaries: (folders: string[]) => ipcRenderer.invoke('get-folder-summaries', folders),
  onUpdateDownloadProgress: (listener: (percent: number) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, percent: number) => listener(percent)
    ipcRenderer.on('update-download-progress', handler)
    return () => ipcRenderer.removeListener('update-download-progress', handler)
  },
})