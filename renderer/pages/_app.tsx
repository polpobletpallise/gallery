import type { AppProps } from 'next/app'

import '../styles/globals.css'
import { ThemeProvider } from '../components/theme-provider'
import { LanguageProvider } from '../components/language-provider'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </LanguageProvider>
  )
}

export default MyApp
