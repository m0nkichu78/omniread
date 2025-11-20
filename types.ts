export enum Language {
  FRENCH = 'Français',
  ENGLISH = 'English',
  SPANISH = 'Español',
  GERMAN = 'Deutsch',
  ITALIAN = 'Italiano',
  JAPANESE = '日本語'
}

export enum Tone {
  NEUTRAL = 'Neutre',
  PROFESSIONAL = 'Professionnel',
  SIMPLIFIED = 'Simplifié (ELI5)',
  SPIRITUAL = 'Spirituel'
}

export enum Mode {
  FULL = 'Lecture Complète',
  SUMMARY = 'Résumé Essentiel'
}

export interface ReadingConfig {
  targetLanguage: Language;
  tone: Tone;
  mode: Mode;
}

export interface ProcessedArticle {
  id: string;
  originalUrl?: string;
  title: string;
  summaryQuote: string; // The italicized intro
  content: string; // Markdown or plain text
  readingTimeMinutes: number;
  date: string;
  languageCode: string; // 'FR', 'EN', etc.
  sourceName: string;
  config: ReadingConfig;
  audioUrl?: string; // Blob URL for current session audio
}

// Using the Google GenAI Schema types logic
export interface AIResponseSchema {
  title: string;
  summaryQuote: string;
  content: string;
  readingTimeMinutes: number;
  sourceName: string;
}