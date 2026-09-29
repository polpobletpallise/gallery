import path from 'path'
import fs from 'fs'
import { pathToFileURL } from 'url'
import exifr from 'exifr'
import { app, ipcMain, dialog, protocol, net, shell } from 'electron'
import serve from 'electron-serve'
import { getMediaType, type MediaType } from '../shared/media-formats.js'
import { createWindow } from './helpers/create-window'

const isProd = process.env.NODE_ENV === 'production'

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local-media',
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true },
  },
])

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

// Registrar el protocolo local
app.whenReady().then(() => {
  protocol.handle('local-media', (request) => {
    let filePath: string

    try {
      const mediaUrl = new URL(request.url)
      if (mediaUrl.hostname !== 'media') {
        return new Response('Ruta multimedia no válida.', { status: 400 })
      }
      filePath = decodeURIComponent(mediaUrl.pathname.slice(1))
    } catch (error) {
      console.error('No se pudo interpretar la URL multimedia:', error)
      return new Response('Ruta multimedia no válida.', { status: 400 })
    }

    if (!path.isAbsolute(filePath)) {
      return new Response('Ruta multimedia no válida.', { status: 400 })
    }

    return net.fetch(pathToFileURL(filePath).toString(), { headers: request.headers })
  })
})

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
  }
})().catch((error: unknown) => {
  console.error('Error al iniciar la ventana principal:', error)
  app.quit()
})

app.on('window-all-closed', () => {
  app.quit()
})

// ==========================================
// REGISTRO DE HANDLERS IPC (Asegúrate de que están aquí abajo)
// ==========================================

// Al final de main/main.ts
console.log('>>> CARGANDO HANDLERS IPC DE ELECTRON <<<')

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

ipcMain.handle('get-special-folders', () => {
  const specialFolderTypes = ['desktop', 'downloads', 'documents', 'pictures', 'music', 'videos'] as const
  return specialFolderTypes.flatMap((type) => {
    try {
      return [{ type, path: app.getPath(type) }]
    } catch (error) {
      console.warn(`Could not resolve the ${type} folder:`, error)
      return []
    }
  })
})

ipcMain.handle('open-location', async (_event, targetPath: unknown) => {
  if (typeof targetPath !== 'string' || !path.isAbsolute(targetPath)) {
    throw new TypeError('La ruta que se quiere abrir no es válida.')
  }

  const stat = await fs.promises.stat(targetPath)
  if (stat.isDirectory()) {
    const errorMessage = await shell.openPath(targetPath)
    if (errorMessage) {
      throw new Error(`No se pudo abrir la carpeta ${targetPath}: ${errorMessage}`)
    }
    return
  }

  shell.showItemInFolder(targetPath)
})

interface MediaFile {
  name: string
  path: string
  type: MediaType
  folder: string
  date: string
}

async function getCaptureDate(filePath: string, fileType: MediaType, fallbackDate: Date): Promise<Date> {
  if (fileType === 'image') {
    try {
      const metadata = await exifr.parse(filePath, ['DateTimeOriginal', 'CreateDate'])
      const captureDate = metadata?.DateTimeOriginal ?? metadata?.CreateDate
      if (captureDate instanceof Date && !Number.isNaN(captureDate.getTime())) {
        return captureDate
      }
    } catch (error) {
      console.warn(`No se pudieron leer los metadatos de fecha de ${filePath}:`, error)
    }
  }

  return fallbackDate
}

async function listMediaFiles(folderPaths: string[]): Promise<MediaFile[]> {
  const mediaFiles: MediaFile[] = []

  for (const folderPath of folderPaths) {
    try {
      const folderStat = await fs.promises.stat(folderPath)
      if (!folderStat.isDirectory()) continue

      const files = await fs.promises.readdir(folderPath, { withFileTypes: true })

      for (const file of files) {
        if (!file.isFile()) continue

        const fullPath = path.join(folderPath, file.name)
        const type = getMediaType(file.name)
        if (!type) continue

        try {
          const stat = await fs.promises.stat(fullPath)
          const fallbackDate = stat.birthtime.getTime() > 0 ? stat.birthtime : stat.mtime
          const date = await getCaptureDate(fullPath, type, fallbackDate)
          mediaFiles.push({
            name: file.name,
            path: fullPath,
            type,
            folder: folderPath,
            date: date.toISOString(),
          })
        } catch (error) {
          console.error(`Error leyendo el archivo multimedia ${fullPath}:`, error)
        }
      }
    } catch (error) {
      console.error(`Error leyendo la carpeta ${folderPath}:`, error)
    }
  }

  return mediaFiles
}

function validateFolderPaths(folderPaths: unknown): folderPaths is string[] {
  return Array.isArray(folderPaths) && folderPaths.every((folderPath) => typeof folderPath === 'string')
}

ipcMain.handle('get-media-files', async (_event, folderPaths: unknown) => {
  if (!validateFolderPaths(folderPaths)) {
    throw new TypeError('La lista de carpetas multimedia no es válida.')
  }

  return listMediaFiles(folderPaths)
})

ipcMain.handle('get-folder-summaries', async (_event, folderPaths: unknown) => {
  if (!validateFolderPaths(folderPaths)) {
    throw new TypeError('La lista de carpetas multimedia no es válida.')
  }

  const mediaFiles = await listMediaFiles(folderPaths)
  return Promise.all(
    folderPaths.map(async (folderPath) => {
      try {
        const stat = await fs.promises.stat(folderPath)
        if (!stat.isDirectory()) {
          return { path: folderPath, exists: false, fileCount: 0, yearRange: null }
        }

        const folderFiles = mediaFiles.filter((file) => file.folder === folderPath)
        const dates = folderFiles
          .map((file) => new Date(file.date).getFullYear())
          .filter((year) => Number.isFinite(year))
        const yearRange = dates.reduce<{ first: number; last: number } | null>(
          (range, year) =>
            range
              ? { first: Math.min(range.first, year), last: Math.max(range.last, year) }
              : { first: year, last: year },
          null,
        )

        return {
          path: folderPath,
          exists: true,
          fileCount: folderFiles.length,
          yearRange: yearRange === null ? null : yearRange.first === yearRange.last
            ? `${yearRange.first}`
            : `${yearRange.first}–${yearRange.last}`,
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT' || (error as NodeJS.ErrnoException).code === 'ENOTDIR') {
          return { path: folderPath, exists: false, fileCount: 0, yearRange: null }
        }
        console.error(`Error comprobando la carpeta ${folderPath}:`, error)
        throw error
      }
    }),
  )
})