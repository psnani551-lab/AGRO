'use client';

import ChatWidget from './ChatWidget';
import { useI18n } from '@/lib/i18n';
import { LocationCoordinates } from '@/lib/geo';

// This wrapper component allows ChatWidget to access the i18n context
// while still being a client component that can be used in the root layout.
export default function ChatWidgetWithLocale() {
  const { locale } = useI18n();
  // In a real app, you would get the location from a state management library or context
  const location: LocationCoordinates | undefined = undefined;
  return <ChatWidget locale={locale} location={location} />;
}