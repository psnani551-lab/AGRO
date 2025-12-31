// Server-side translations for API responses
// This allows the API to return translated content based on locale

import { translations } from './translations';
import type { Locale as TranslationsLocale } from './translations';

export type Locale = TranslationsLocale;

export function getServerTranslation(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: any = translations[locale] || translations.en;
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

// Translation maps for dynamic content
export const growthStageTranslations: Record<string, Record<string, string>> = {
  en: {
    'Initial': 'Initial',
    'Development': 'Development',
    'Mid-Season': 'Mid-Season',
    'Late Season': 'Late Season',
    'Maturity': 'Maturity',
  },
  hi: {
    'Initial': 'प्रारंभिक',
    'Development': 'विकास',
    'Mid-Season': 'मध्य-मौसम',
    'Late Season': 'देर से मौसम',
    'Maturity': 'परिपक्वता',
  },
  te: {
    'Initial': 'ప్రారంభ',
    'Development': 'అభివృద్ధి',
    'Mid-Season': 'మధ్య-కాలం',
    'Late Season': 'చివరి కాలం',
    'Maturity': 'పరిపక్వత',
  },
  mr: {
    'Initial': 'प्रारंभिक',
    'Development': 'विकास',
    'Mid-Season': 'मध्य-हंगाम',
    'Late Season': 'उशीरा हंगाम',
    'Maturity': 'परिपक्वता',
  },
  ta: {
    'Initial': 'ஆரம்ப',
    'Development': 'வளர்ச்சி',
    'Mid-Season': 'நடு-பருவம்',
    'Late Season': 'பிற்பருவம்',
    'Maturity': 'முதிர்ச்சி',
  },
  kn: {
    'Initial': 'ಆರಂಭಿಕ',
    'Development': 'ಅಭಿವೃದ್ಧಿ',
    'Mid-Season': 'ಮಧ್ಯ-ಋತು',
    'Late Season': 'ತಡವಾದ ಋತು',
    'Maturity': 'ಪ್ರಬುದ್ಧತೆ',
  },
  ml: {
    'Initial': 'പ്രാരംഭ',
    'Development': 'വികസനം',
    'Mid-Season': 'മധ്യ-സീസൺ',
    'Late Season': 'അവസാന സീസൺ',
    'Maturity': 'പക്വത',
  },
};

export const frequencyTranslations: Record<string, Record<string, string>> = {
  en: {
    'Every day': 'Every day',
    'Every 2 days': 'Every 2 days',
    'Every 3 days': 'Every 3 days',
    'Every 4 days': 'Every 4 days',
    'Every 5 days': 'Every 5 days',
    'Every 6 days': 'Every 6 days',
    'Every 7 days': 'Every 7 days',
    'Every week': 'Every week',
    'Twice a week': 'Twice a week',
  },
  hi: {
    'Every day': 'हर दिन',
    'Every 2 days': 'हर 2 दिन',
    'Every 3 days': 'हर 3 दिन',
    'Every 4 days': 'हर 4 दिन',
    'Every 5 days': 'हर 5 दिन',
    'Every 6 days': 'हर 6 दिन',
    'Every 7 days': 'हर 7 दिन',
    'Every week': 'हर सप्ताह',
    'Twice a week': 'सप्ताह में दो बार',
  },
  te: {
    'Every day': 'ప్రతిరోజు',
    'Every 2 days': 'ప్రతి 2 రోజులు',
    'Every 3 days': 'ప్రతి 3 రోజులు',
    'Every 4 days': 'ప్రతి 4 రోజులు',
    'Every 5 days': 'ప్రతి 5 రోజులు',
    'Every 6 days': 'ప్రతి 6 రోజులు',
    'Every 7 days': 'ప్రతి 7 రోజులు',
    'Every week': 'ప్రతి వారం',
    'Twice a week': 'వారానికి రెండుసార్లు',
  },
  mr: {
    'Every day': 'दररोज',
    'Every 2 days': 'दर 2 दिवसांनी',
    'Every 3 days': 'दर 3 दिवसांनी',
    'Every 4 days': 'दर 4 दिवसांनी',
    'Every 5 days': 'दर 5 दिवसांनी',
    'Every 6 days': 'दर 6 दिवसांनी',
    'Every 7 days': 'दर 7 दिवसांनी',
    'Every week': 'दर आठवड्याला',
    'Twice a week': 'आठवड्यातून दोनदा',
  },
  ta: {
    'Every day': 'தினமும்',
    'Every 2 days': 'ஒவ்வொரு 2 நாட்களுக்கும்',
    'Every 3 days': 'ஒவ்வொரு 3 நாட்களுக்கும்',
    'Every 4 days': 'ஒவ்வொரு 4 நாட்களுக்கும்',
    'Every 5 days': 'ஒவ்வொரு 5 நாட்களுக்கும்',
    'Every 6 days': 'ஒவ்வொரு 6 நாட்களுக்கும்',
    'Every 7 days': 'ஒவ்வொரு 7 நாட்களுக்கும்',
    'Every week': 'ஒவ்வொரு வாரமும்',
    'Twice a week': 'வாரத்திற்கு இரண்டு முறை',
  },
  kn: {
    'Every day': 'ಪ್ರತಿದಿನ',
    'Every 2 days': 'ಪ್ರತಿ 2 ದಿನಗಳು',
    'Every 3 days': 'ಪ್ರತಿ 3 ದಿನಗಳು',
    'Every 4 days': 'ಪ್ರತಿ 4 ದಿನಗಳು',
    'Every 5 days': 'ಪ್ರತಿ 5 ದಿನಗಳು',
    'Every 6 days': 'ಪ್ರತಿ 6 ದಿನಗಳು',
    'Every 7 days': 'ಪ್ರತಿ 7 ದಿನಗಳು',
    'Every week': 'ಪ್ರತಿ ವಾರ',
    'Twice a week': 'ವಾರಕ್ಕೆ ಎರಡು ಬಾರಿ',
  },
  ml: {
    'Every day': 'എല്ലാ ദിവസവും',
    'Every 2 days': 'ഓരോ 2 ദിവസവും',
    'Every 3 days': 'ഓരോ 3 ദിവസവും',
    'Every 4 days': 'ഓരോ 4 ദിവസവും',
    'Every 5 days': 'ഓരോ 5 ദിവസവും',
    'Every 6 days': 'ഓരോ 6 ദിവസവും',
    'Every 7 days': 'ഓരോ 7 ദിവസവും',
    'Every week': 'എല്ലാ ആഴ്ചയും',
    'Twice a week': 'ആഴ്ചയിൽ രണ്ടുതവണ',
  },
};

export const riskLevelTranslations: Record<string, Record<string, string>> = {
  en: {
    'Low': 'Low',
    'Medium': 'Medium',
    'High': 'High',
    'low': 'low',
    'medium': 'medium',
    'high': 'high',
  },
  hi: {
    'Low': 'कम',
    'Medium': 'मध्यम',
    'High': 'उच्च',
    'low': 'कम',
    'medium': 'मध्यम',
    'high': 'उच्च',
  },
  te: {
    'Low': 'తక్కువ',
    'Medium': 'మధ్యస్థ',
    'High': 'అధిక',
    'low': 'తక్కువ',
    'medium': 'మధ్యస్థ',
    'high': 'అధిక',
  },
  mr: {
    'Low': 'कमी',
    'Medium': 'मध्यम',
    'High': 'उच्च',
    'low': 'कमी',
    'medium': 'मध्यम',
    'high': 'उच्च',
  },
  ta: {
    'Low': 'குறைந்த',
    'Medium': 'நடுத்தர',
    'High': 'அதிக',
    'low': 'குறைந்த',
    'medium': 'நடுத்தர',
    'high': 'அதிக',
  },
  kn: {
    'Low': 'ಕಡಿಮೆ',
    'Medium': 'ಮಧ್ಯಮ',
    'High': 'ಹೆಚ್ಚು',
    'low': 'ಕಡಿಮೆ',
    'medium': 'ಮಧ್ಯಮ',
    'high': 'ಹೆಚ್ಚು',
  },
  ml: {
    'Low': 'കുറവ്',
    'Medium': 'ഇടത്തരം',
    'High': 'ഉയർന്ന',
    'low': 'കുറവ്',
    'medium': 'ഇടത്തരം',
    'high': 'ഉയർന്ന',
  },
};

export function translateGrowthStage(stage: string, locale: Locale): string {
  return growthStageTranslations[locale]?.[stage] || stage;
}

export function translateFrequency(frequency: string, locale: Locale): string {
  return frequencyTranslations[locale]?.[frequency] || frequency;
}

export function translateRiskLevel(level: string, locale: Locale): string {
  return riskLevelTranslations[locale]?.[level] || level;
}
