'use client';
import { translations } from './translations';

export type Locale = keyof typeof translations;

export function getToolTranslation(locale: Locale, section: string, key: string): string {
  const sectionData = (translations[locale] as any)?.[section];
  if (sectionData && typeof sectionData === 'object' && key in sectionData) {
    return sectionData[key];
  }
  // Fallback to English
  const enSection = (translations['en'] as any)?.[section];
  if (enSection && typeof enSection === 'object' && key in enSection) {
    return enSection[key];
  }
  return key;
}
