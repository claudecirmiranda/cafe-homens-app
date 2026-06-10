export interface DevotionalSummary {
  daily_word: string
  main_summary: string
  reflection_point: string
  daily_encouragement: string
  daily_prayer: string
}

export interface Devotional {
  id: number
  date: string
  weekly_theme: string
  bible_reference: string
  bible_text: string
  audio_url: string
  reflection: string
  practical_connection: string
  practical_question: string
  applications: string[]
  final_message: string
  next_day_preview: string
  daily_word: string
  main_summary: string
  reflection_point: string
  daily_encouragement: string
  daily_prayer: string
  hashtags: string[]
  day_of_year: string
  summary?: DevotionalSummary
}

export interface DevotionalListItem {
  id: number
  date: string
  weekly_theme: string
  bible_reference: string
  daily_word: string
}

export interface DevotionalListResponse {
  total: number
  page: number
  items: DevotionalListItem[]
}

export interface User {
  id: number
  name: string
  email: string
  token: string
}

export interface ProgressStats {
  total: number
  read: number
  completed: number
  percentage: number
}

export interface DevotionalNote {
  content: string
  updated_at: string | null
}

export interface FavoriteItem {
  id: number
  date: string
  weekly_theme: string
  bible_reference: string
  daily_word: string
}
