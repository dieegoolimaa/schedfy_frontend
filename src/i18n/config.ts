import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

import enCommon from './locales/en/common.json'
import ptCommon from './locales/pt/common.json'
import enAuth from './locales/en/auth.json'
import ptAuth from './locales/pt/auth.json'
import enDashboard from './locales/en/dashboard.json'
import ptDashboard from './locales/pt/dashboard.json'

const resources = {
    en: {
        common: enCommon,
        auth: enAuth,
        dashboard: enDashboard,
    },
    pt: {
        common: ptCommon,
        auth: ptAuth,
        dashboard: ptDashboard,
    },
}

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',

        interpolation: {
            escapeValue: false,
        },

        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
        },

        react: {
            useSuspense: false,
        },
    })

export default i18n