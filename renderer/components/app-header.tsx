import Link from 'next/link'
import { ArrowLeft, FolderOpen, ZoomIn, ZoomOut } from 'lucide-react'
import { ThemeToggle } from './theme-provider'
import { useI18n } from './language-provider'

interface AppHeaderProps {
  eyebrow: string
  title: string
  description: string
  backHref?: string
}

export function AppHeader({ eyebrow, title, description, backHref }: AppHeaderProps) {
  const { language, setLanguage, t } = useI18n()

  const changeZoom = async (direction: 'in' | 'out') => {
    if (!window.electronAPI) return

    try {
      await window.electronAPI.changeZoom(direction)
    } catch (error) {
      console.error('Could not change the app zoom level:', error)
    }
  }

  return (
    <header className="app-header">
      <div className="topbar">
        <Link className="brand" href="/home" aria-label="Gallery">
          <span className="brand-mark">
            <FolderOpen size={20} strokeWidth={2.1} />
          </span>
          <span className="brand-name">gallery<span>.</span></span>
        </Link>
        <div className="topbar-controls">
          <label className="language-control">
            <span className="sr-only">{t('language')}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as 'en' | 'es' | 'ca')}
              aria-label={t('language')}
            >
              <option value="en">English</option>
              <option value="ca">Català</option>
              <option value="es">Español</option>
            </select>
          </label>
          <button
            className="zoom-control"
            type="button"
            aria-label={t('zoomOut')}
            title={t('zoomOut')}
            onClick={() => void changeZoom('out')}
          >
            <ZoomOut size={17} />
          </button>
          <button
            className="zoom-control"
            type="button"
            aria-label={t('zoomIn')}
            title={t('zoomIn')}
            onClick={() => void changeZoom('in')}
          >
            <ZoomIn size={17} />
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="page-intro">
        {backHref && (
          <Link className="back-link" href={backHref}>
            <ArrowLeft size={15} />
            <span>{t('backToFolders')}</span>
          </Link>
        )}
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
    </header>
  )
}
