/**
 * Single source of truth for static URL segments. Consumed by route configs, guards, and any
 * component performing imperative navigation, so a segment rename fails at the call site rather
 * than silently routing wrong.
 *
 * Segments have no leading slash (except ROOT); the router/callers add slashes as needed.
 */
export const APP_PATHS = {
  FEATURES: {
    ROOT: '/',
    LOGIN: 'login',
    CONFIRM_EMAIL: 'confirm-email',
    PAGE_NOT_FOUND: '404',
    ADMIN: 'admin',
    TEAMS: 'teams',
    USERS: 'users',
    GROUPS: 'groups',
    RULES: 'rules',
    TABLES: 'tables',
    FIXTURES: 'fixtures',
    PROFILE: 'profile',
    DASHBOARD: 'dashboard',
  },

  SECTIONS: {
    LIST: 'list',
    DETAIL: 'detail',
    CREATE: 'create',
    EDIT: 'edit',
  },
} as const;
