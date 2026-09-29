import type { AppProps } from 'next/app'

import '../styles/globals.css'
import { ThemeProvider } from '../components/theme-provider'
import { LanguageProvider } from '../components/language-provider'
import { UpdateProgress } from '../components/update-progress'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <UpdateProgress />
        <Component {...pageProps} />
      </ThemeProvider>
    </LanguageProvider>
  )
}

export default MyApp
