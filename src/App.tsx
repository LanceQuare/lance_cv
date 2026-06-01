import { useEffect, useState } from 'react'
import { cvVersions, type CvVersion } from './data/cv'
import {
  dictionaries,
  formatText,
  getInitialLanguage,
  LANGUAGE_STORAGE_KEY,
  languageCodes,
  type LanguageCode,
} from './i18n'

const VERSION_STORAGE_KEY = 'lance-cv:version'
const THEME_STORAGE_KEY = 'lance-cv:theme'

const sectionLinks = [
  { href: '#summary', labelKey: 'summary' },
  { href: '#skills', labelKey: 'skills' },
  { href: '#highlights', labelKey: 'highlights' },
  { href: '#experience', labelKey: 'experience' },
  { href: '#education', labelKey: 'education' },
] as const

type ThemeMode = 'system' | 'light' | 'dark'

function isCvVersion(value: string | null): value is CvVersion {
  return cvVersions.some((version) => version === value)
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark'
}

function getInitialVersion(): CvVersion {
  if (typeof window === 'undefined') {
    return 'a'
  }

  const params = new URLSearchParams(window.location.search)
  const urlVersion = params.get('version')

  if (isCvVersion(urlVersion)) {
    return urlVersion
  }

  const storedVersion = window.localStorage.getItem(VERSION_STORAGE_KEY)
  return isCvVersion(storedVersion) ? storedVersion : 'a'
}

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'system'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isThemeMode(storedTheme) ? storedTheme : 'system'
}

function applyTheme(themeMode: ThemeMode) {
  if (typeof window === 'undefined') {
    return
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolvedTheme = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode

  document.documentElement.dataset.themeMode = themeMode
  document.documentElement.dataset.theme = resolvedTheme
}

function useAnalyticsScript() {
  useEffect(() => {
    const scriptUrl = import.meta.env.VITE_ANALYTICS_SCRIPT_URL

    if (!scriptUrl) {
      return
    }

    const existingScript = document.querySelector(
      `script[data-analytics-script="${scriptUrl}"]`,
    )

    if (existingScript) {
      return
    }

    const script = document.createElement('script')
    script.defer = true
    script.src = scriptUrl
    script.setAttribute('data-analytics-script', scriptUrl)

    if (import.meta.env.VITE_ANALYTICS_DATA_DOMAIN) {
      script.setAttribute('data-domain', import.meta.env.VITE_ANALYTICS_DATA_DOMAIN)
    }

    if (import.meta.env.VITE_ANALYTICS_WEBSITE_ID) {
      script.setAttribute(
        'data-website-id',
        import.meta.env.VITE_ANALYTICS_WEBSITE_ID,
      )
    }

    if (import.meta.env.VITE_ANALYTICS_HOST_URL) {
      script.setAttribute('data-host-url', import.meta.env.VITE_ANALYTICS_HOST_URL)
    }

    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])
}

function SectionHeader({
  kicker,
  title,
  description,
}: {
  kicker: string
  title: string
  description: string
}) {
  return (
    <div className="section-header">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h2 className="section-title">{title}</h2>
      </div>
      <p className="section-description">{description}</p>
    </div>
  )
}

function App() {
  useAnalyticsScript()

  const [activeVersion, setActiveVersion] = useState<CvVersion>(() => getInitialVersion())
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getInitialThemeMode())
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>(() => getInitialLanguage())

  const copy = dictionaries[activeLanguage]
  const profile = copy.profiles[activeVersion]
  const alternateVersion = copy.profiles[activeVersion === 'a' ? 'b' : 'a']

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const params = new URLSearchParams(window.location.search)
    params.set('version', activeVersion)

    const search = params.toString()
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
    window.history.replaceState({}, '', nextUrl)
    window.localStorage.setItem(VERSION_STORAGE_KEY, activeVersion)
  }, [activeVersion])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const params = new URLSearchParams(window.location.search)
    params.set('lang', activeLanguage)

    const search = params.toString()
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
    window.history.replaceState({}, '', nextUrl)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, activeLanguage)
  }, [activeLanguage])

  useEffect(() => {
    applyTheme(themeMode)

    if (typeof window === 'undefined') {
      return
    }

    if (themeMode === 'system') {
      window.localStorage.removeItem(THEME_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
  }, [themeMode])

  useEffect(() => {
    if (typeof window === 'undefined' || themeMode !== 'system') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme('system')

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [themeMode])

  useEffect(() => {
    document.documentElement.lang = activeLanguage
    document.title = `${profile.name} | ${profile.focus}`

    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', profile.summary)
    }
  }, [activeLanguage, profile])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {copy.actions.skipToContent}
      </a>

      <header className="hero-panel">
        <div className="hero-panel__row">
          <div className="hero-panel__headline">
            <p className="eyebrow">{profile.focus}</p>
            <h1>{profile.name}</h1>
            <p className="hero-role">{profile.role}</p>
          </div>

          <div className="hero-panel__controls" aria-label={copy.aria.profileControls}>
            <div className="control-block">
              <p className="control-label">{copy.controls.profileView}</p>
              <div
                className="toggle-group toggle-group--profile"
                role="group"
                aria-label={copy.aria.selectCvVersion}
              >
                {cvVersions.map((version) => (
                  <button
                    key={version}
                    type="button"
                    className={`toggle-button${activeVersion === version ? ' is-active' : ''}`}
                    onClick={() => setActiveVersion(version)}
                  >
                    {copy.profiles[version].shortLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-block">
              <p className="control-label">{copy.controls.theme}</p>
              <div className="toggle-group" role="group" aria-label={copy.aria.selectColorTheme}>
                {(['system', 'light', 'dark'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`toggle-button${themeMode === mode ? ' is-active' : ''}`}
                    onClick={() => setThemeMode(mode)}
                  >
                    {copy.controls.themeOptions[mode]}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-block">
              <p className="control-label">{copy.controls.language}</p>
              <div className="toggle-group" role="group" aria-label={copy.aria.selectLanguage}>
                {languageCodes.map((language) => (
                  <button
                    key={language}
                    type="button"
                    className={`toggle-button${activeLanguage === language ? ' is-active' : ''}`}
                    onClick={() => setActiveLanguage(language)}
                    lang={language}
                  >
                    {copy.languageOptions[language]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="hero-summary">{profile.summary}</p>

        <div className="hero-actions">
          <a className="button button--primary" href={profile.pdfPath} download>
            {formatText(copy.actions.downloadPdf, { label: profile.label })}
          </a>
          <button type="button" className="button button--secondary" onClick={() => window.print()}>
            {copy.actions.printPage}
          </button>
          <a className="button button--ghost" href={`mailto:${profile.email}`}>
            {copy.actions.contact}
          </a>
        </div>

        <dl className="hero-metrics">
          {profile.metrics.map((metric) => (
            <div className="metric-card" key={metric.label}>
              <dt className="metric-label">{metric.label}</dt>
              <dd className="metric-value">{metric.value}</dd>
            </div>
          ))}
        </dl>

        <nav className="section-nav" aria-label={copy.aria.pageSections}>
          {sectionLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {copy.sections.nav[link.labelKey]}
            </a>
          ))}
        </nav>
      </header>

      <main id="main-content" className="content-grid">
        <section className="panel" id="summary" aria-labelledby="summary-title">
          <SectionHeader
            kicker={copy.sections.summary.kicker}
            title={copy.sections.summary.title}
            description={formatText(copy.sections.summary.description, {
              currentLabel: profile.label,
              alternateLabel: alternateVersion.label,
            })}
          />

          <div className="summary-grid">
            <div className="copy-block">
              <p>{profile.intro}</p>
              <p>{profile.positioning}</p>
            </div>

            <aside className="aside-card">
              <p className="aside-card__label">{copy.sections.summary.asideLabel}</p>
              <h3>{profile.emphasisTitle}</h3>
              <p>{profile.emphasisBody}</p>

              <div className="contact-list" aria-label={copy.aria.contactLinks}>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  {copy.actions.linkedInProfile}
                </a>
                <span>{profile.location}</span>
              </div>
            </aside>
          </div>

          <ul className="strength-list">
            {profile.strengths.map((strength, index) => (
              <li key={strength}>
                <span className="strength-index">{String(index + 1).padStart(2, '0')}</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel" id="skills" aria-labelledby="skills-title">
          <SectionHeader
            kicker={copy.sections.skills.kicker}
            title={copy.sections.skills.title}
            description={copy.sections.skills.description}
          />

          <div className="skills-grid">
            {profile.skillGroups.map((group) => (
              <article className="skill-card" key={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="highlights" aria-labelledby="highlights-title">
          <SectionHeader
            kicker={copy.sections.highlights.kicker}
            title={copy.sections.highlights.title}
            description={copy.sections.highlights.description}
          />

          <div className="highlights-grid">
            {profile.highlights.map((highlight) => (
              <article className="highlight-card" key={highlight.title}>
                <div className="card-meta">
                  <span>{highlight.company}</span>
                  <span>{highlight.period}</span>
                </div>
                <div>
                  <h3>{highlight.title}</h3>
                  <p>{highlight.summary}</p>
                </div>
                <p className="highlight-outcome">{highlight.outcome}</p>
                <ul
                  className="stack-list"
                  aria-label={formatText(copy.aria.stackLabel, { title: highlight.title })}
                >
                  {highlight.stack.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="experience" aria-labelledby="experience-title">
          <SectionHeader
            kicker={copy.sections.experience.kicker}
            title={copy.sections.experience.title}
            description={copy.sections.experience.description}
          />

          <div className="timeline">
            {profile.experience.map((role) => (
              <article className="timeline-item" key={`${role.company}-${role.title}-${role.period}`}>
                <div className="role-header">
                  <div>
                    <p className="role-company">{role.company}</p>
                    <h3 className="role-title">{role.title}</h3>
                  </div>
                  <div className="role-meta">
                    <span>{role.location}</span>
                    <span>{role.period}</span>
                  </div>
                </div>

                <ul className="bullet-list">
                  {role.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="two-column" id="education" aria-labelledby="education-title">
          <div className="panel panel--compact">
            <SectionHeader
              kicker={copy.sections.education.kicker}
              title={copy.sections.education.title}
              description={copy.sections.education.description}
            />

            {profile.education.map((entry) => (
              <article className="education-card" key={entry.institution}>
                <h3>{entry.institution}</h3>
                <p>{entry.degree}</p>
                <p>{entry.location}</p>
                <p>{entry.period}</p>
              </article>
            ))}
          </div>

          <div className="panel panel--compact">
            <SectionHeader
              kicker={copy.sections.deployment.kicker}
              title={copy.sections.deployment.title}
              description={copy.sections.deployment.description}
            />

            <div className="deployment-notes">
              {copy.sections.deployment.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          {formatText(copy.footer.identity, {
            name: profile.name,
            location: profile.location,
          })}
        </p>
        <div className="site-footer__links">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            {copy.actions.linkedIn}
          </a>
          <a href={profile.pdfPath} download>
            {formatText(copy.actions.profilePdf, { label: profile.label })}
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
