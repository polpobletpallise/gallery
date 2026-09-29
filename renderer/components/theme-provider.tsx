import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useI18n } from './language-provider'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const THEME_STORAGE_KEY = 'gallery_theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme)
      }
    } catch (error) {
      console.error('No se pudo cargar la preferencia de tema:', error)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'

      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
      } catch (error) {
        console.error('No se pudo guardar la preferencia de tema:', error)
      }

      return nextTheme
    })
  }, [])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function ThemeToggle() {
  const context = useContext(ThemeContext)
  const { t } = useI18n()

  if (!context) {
    throw new Error('ThemeToggle debe usarse dentro de ThemeProvider')
  }

  const { theme, toggleTheme } = context
  const nextTheme = theme === 'dark' ? t('themeLight') : t('themeDark')

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={t('changeTheme', { theme: nextTheme })}
      title={t('changeTheme', { theme: nextTheme })}
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      <span>{theme === 'dark' ? t('themeLight') : t('themeDark')}</span>
    </button>
  )
}
