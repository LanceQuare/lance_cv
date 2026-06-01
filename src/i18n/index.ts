import type { CvProfile, CvVersion } from '../data/cv'
import en from './locales/en.json'
import zh from './locales/zh.json'

export const LANGUAGE_STORAGE_KEY = 'lance-cv:language'
export const languageCodes = ['en', 'zh'] as const

export type LanguageCode = (typeof languageCodes)[number]
export type ThemeModeCopy = Record<'system' | 'light' | 'dark', string>

export interface LocaleDictionary {
  languageName: string
  languageOptions: Record<LanguageCode, string>
  aria: {
    profileControls: string
    selectCvVersion: string
    selectColorTheme: string
    selectLanguage: string
    pageSections: string
    contactLinks: string
    stackLabel: string
  }
  controls: {
    profileView: string
    theme: string
    language: string
    themeOptions: ThemeModeCopy
  }
  actions: {
    skipToContent: string
    downloadPdf: string
    printPage: string
    contact: string
    linkedInProfile: string
    linkedIn: string
    profilePdf: string
  }
  sections: {
    nav: Record<'summary' | 'skills' | 'highlights' | 'experience' | 'education', string>
    summary: {
      kicker: string
      title: string
      description: string
      asideLabel: string
    }
    skills: SectionCopy
    highlights: SectionCopy
    experience: SectionCopy
    education: SectionCopy
    deployment: SectionCopy & {
      paragraphs: string[]
    }
  }
  footer: {
    identity: string
  }
  profiles: Record<CvVersion, CvProfile>
}

interface SectionCopy {
  kicker: string
  title: string
  description: string
}

export const dictionaries: Record<LanguageCode, LocaleDictionary> = {
  en,
  zh,
}

export function isLanguageCode(value: string | null): value is LanguageCode {
  return languageCodes.some((code) => code === value)
}

export function getInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const params = new URLSearchParams(window.location.search)
  const urlLanguage = params.get('lang')

  if (isLanguageCode(urlLanguage)) {
    return urlLanguage
  }

  if (urlLanguage !== null) {
    return 'en'
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (isLanguageCode(storedLanguage)) {
    return storedLanguage
  }

  return window.navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export function formatText(template: string, values: Record<string, string>) {
  return template.replace(/\{([a-zA-Z0-9]+)\}/g, (match, key: string) => values[key] ?? match)
}
