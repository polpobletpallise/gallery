import { useEffect, useState } from 'react'
import { useI18n } from './language-provider'

export function UpdateProgress() {
  const { t } = useI18n()
  const [progress, setProgress] = useState<number | null>(null)

  useEffect(() => {
    if (!window.electronAPI) return
    return window.electronAPI.onUpdateDownloadProgress((percent) => {
      setProgress(Math.min(100, Math.max(0, percent)))
    })
  }, [])

  if (progress === null) return null

  return (
    <div className="update-progress" role="status">
      <div className="update-progress-copy">
        <span>{t('updateDownloading')}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div
        className="update-progress-track"
        role="progressbar"
        aria-label={t('updateDownloading')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className="update-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
