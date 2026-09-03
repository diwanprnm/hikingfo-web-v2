import { useI18n } from 'vue-i18n'

/** Language helper: swap the active chrome locale and persist the choice. */
export function useLocaleToggle() {
  const { locale } = useI18n()

  function toggle() {
    const next: 'id' | 'en' = locale.value === 'id' ? 'en' : 'id'
    locale.value = next
    try {
      localStorage.setItem('hikingfo.locale', next)
    } catch {
      /* private window — non-fatal */
    }
  }

  return { locale, toggle }
}
