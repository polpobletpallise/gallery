import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AppHeader } from '../components/app-header'
import { useI18n } from '../components/language-provider'
import { SiteFooter } from '../components/site-footer'

export default function NotFoundPage() {
  const { t } = useI18n()

  return (
    <main className="app-shell">
      <AppHeader
        eyebrow={t('notFoundEyebrow')}
        title={`404 — ${t('notFoundTitle')}`}
        description={t('notFoundDescription')}
      />
      <section className="not-found-actions">
        <Link className="primary-button" href="/home">
          <ArrowLeft size={15} />
          {t('notFoundHome')}
        </Link>
      </section>
      <SiteFooter />
    </main>
  )
}
