import { FaGithub } from 'react-icons/fa6'
import Logo from './Logo'
import { useI18n } from './language-provider'

export function SiteFooter() {
  const { t } = useI18n()

  return (
    <footer className="site-footer">
      <p className="privacy-notice">{t('privacyNotice')}</p>
      <div className="site-footer-bottom">
        <a
          className="license-link"
          href="https://spdx.org/licenses/GPL-3.0-or-later.html"
          target="_blank"
          rel="noreferrer"
        >
          {t('licenseNotice')}
        </a>
        <div className="site-footer-links">
          <a
            className="social-link"
            href="https://github.com/polpobletpallise"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="GitHub"
          >
            <FaGithub size={19} />
          </a>
          <a
            className="social-link"
            href="https://www.xscouting.net/"
            target="_blank"
            rel="noreferrer"
            aria-label="xScouting"
            title={t('scoutingProject')}
          >
            <Logo className="xscouting-logo" size={21} />
          </a>
        </div>
      </div>
    </footer>
  )
}
