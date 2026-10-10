import type { ThemeDefinition } from 'vuetify'

export const staticPrimaryColor = '#006DFC'
export const staticNavyColor = '#01193A'
export const staticAccentColor = '#00C1B2'

export const themes: Record<string, ThemeDefinition> = {
  light: {
    dark: false,
    colors: {
      primary: staticPrimaryColor,
      'on-primary': '#fff',
      'primary-darken-1': '#01193A',
      secondary: '#00C1B2',
      'on-secondary': '#01193A',
      'secondary-darken-1': '#009488',
      success: '#28C76F',
      'on-success': '#fff',
      info: '#00BAD1',
      'on-info': '#fff',
      warning: '#FF9F43',
      'on-warning': '#fff',
      error: '#FF4C51',
      'on-error': '#fff',
      background: '#f3f4f6',
      'on-background': '#2F2B3D',
      surface: '#fff',
      'on-surface': '#2F2B3D',
      'grey-50': '#FAFAFA',
      'grey-100': '#F5F5F5',
    },
    variables: {
      'border-color': '#2F2B3D',
      'border-opacity': 0.12,
      'high-emphasis-opacity': 0.9,
      'medium-emphasis-opacity': 0.7,
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: staticPrimaryColor,
      'on-primary': '#fff',
      'primary-darken-1': '#7eb6ff',
      secondary: '#00C1B2',
      'on-secondary': '#01193A',
      'secondary-darken-1': '#009488',
      success: '#28C76F',
      'on-success': '#fff',
      info: '#00BAD1',
      'on-info': '#fff',
      warning: '#FF9F43',
      'on-warning': '#fff',
      error: '#FF4C51',
      'on-error': '#fff',
      background: '#15181e',
      'on-background': '#e8eaed',
      surface: '#1e222a',
      'on-surface': '#e8eaed',
      'grey-50': '#2a2f38',
      'grey-100': '#323844',
    },
    variables: {
      'border-color': '#E8EAED',
      'border-opacity': 0.12,
      'high-emphasis-opacity': 0.9,
      'medium-emphasis-opacity': 0.7,
    },
  },
}

export type ThemeChoice = 'light' | 'dark' | 'system'

export function savedThemeChoice(): ThemeChoice {
  if (typeof localStorage === 'undefined') {
    return 'system'
  }
  const value = localStorage.getItem('nx-theme')
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value
  }
  return 'system'
}

export function systemIsDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolvedTheme(choice: ThemeChoice): 'light' | 'dark' {
  if (choice === 'system') {
    return systemIsDark() ? 'dark' : 'light'
  }
  return choice
}

export function savedThemeName(): 'light' | 'dark' {
  return resolvedTheme(savedThemeChoice())
}
