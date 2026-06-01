export const cvVersions = ['a', 'b'] as const

export type CvVersion = (typeof cvVersions)[number]

export interface Metric {
  label: string
  value: string
}

export interface SkillGroup {
  title: string
  items: string[]
}

export interface ProjectHighlight {
  title: string
  company: string
  period: string
  summary: string
  outcome: string
  stack: string[]
}

export interface ExperienceItem {
  company: string
  location: string
  title: string
  period: string
  bullets: string[]
}

export interface EducationItem {
  institution: string
  location: string
  degree: string
  period: string
}

export interface CvProfile {
  label: string
  focus: string
  name: string
  role: string
  location: string
  email: string
  linkedin: string
  summary: string
  intro: string
  positioning: string
  emphasisTitle: string
  emphasisBody: string
  metrics: Metric[]
  strengths: string[]
  skillGroups: SkillGroup[]
  highlights: ProjectHighlight[]
  experience: ExperienceItem[]
  education: EducationItem[]
  pdfPath: string
}
