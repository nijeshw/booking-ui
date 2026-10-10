import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import defaults from './defaults'
import { savedThemeName, themes } from './theme'

export const vuetify = createVuetify({
  defaults,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: savedThemeName(),
    themes,
  },
})
