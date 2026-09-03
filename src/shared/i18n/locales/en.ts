/**
 * English UI-chrome messages. Falls back to `id` for any key not present here
 * (never renders blank — spec Decisions → i18n).
 */
export default {
  app: {
    name: 'hikingfo',
    tagline: 'Indonesia mountain information centre',
  },
  nav: {
    mountains: 'Mountains',
    journeys: 'Journey Reports',
    partners: 'Find a Partner',
    admin: 'Admin',
  },
  lang: {
    toggle: 'Language',
    id: 'Indonesia',
    en: 'English',
  },
  auth: {
    login: 'Sign in',
    register: 'Sign up',
    logout: 'Sign out',
    email: 'Email',
    password: 'Password',
    displayName: 'Display name',
    forgotPassword: 'Forgot password?',
    google: 'Continue with Google',
  },
  common: {
    loading: 'Loading…',
    error: 'Something went wrong',
    retry: 'Try again',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    search: 'Search',
    empty: 'Nothing here yet',
    back: 'Back',
    source: 'Source',
    lastUpdated: 'Last updated',
    notYetAvailable: 'Not yet available',
    viewAll: 'View all',
    readMore: 'Read more',
  },
  notFound: {
    title: 'Page not found',
    body: 'The page you are looking for does not exist or has moved.',
  },
} as const