/**
 * Single source of truth for static URL segments. Consumed by route configs, guards, and any
 * component performing imperative navigation, so a segment rename fails at the call site rather
 * than silently routing wrong.
 *
 * Segments have no leading slash (except ROOT); the router/callers add slashes as needed.
 */
export const APP_PATHS = {
  ROOT: '/',
  LOGIN: 'login',
  CONFIRM_EMAIL: 'confirm-email',
  ADMIN: 'admin',
} as const;
