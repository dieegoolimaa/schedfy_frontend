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
import enBookings from './locales/en/bookings.json'
import ptBookings from './locales/pt/bookings.json'
import enEntity from './locales/en/entity.json'
import ptEntity from './locales/pt/entity.json'
import enNav from './locales/en/nav.json'
import ptNav from './locales/pt/nav.json'
import enServices from './locales/en/services.json'
import ptServices from './locales/pt/services.json'
import enPlatform from './locales/en/platform.json'
import ptPlatform from './locales/pt/platform.json'
import enAdmin from './locales/en/admin.json'
import ptAdmin from './locales/pt/admin.json'
import enProfessional from './locales/en/professional.json'
import ptProfessional from './locales/pt/professional.json'
import enSettings from './locales/en/settings.json'
import ptSettings from './locales/pt/settings.json'
import enAbout from './locales/en/about.json'
import ptAbout from './locales/pt/about.json'
import enFeatures from './locales/en/features.json'
import ptFeatures from './locales/pt/features.json'
import enPricing from './locales/en/pricing.json'
import ptPricing from './locales/pt/pricing.json'
import enOnboarding from './locales/en/onboarding.json'
import ptOnboarding from './locales/pt/onboarding.json'

const resources = {
    en: {
        common: enCommon,
        auth: enAuth,
        dashboard: enDashboard,
        bookings: enBookings,
        entity: enEntity,
        nav: enNav,
        services: enServices,
        platform: enPlatform,
        admin: enAdmin,
        professional: enProfessional,
        settings: enSettings,
        about: enAbout,
        features: enFeatures,
        pricing: enPricing,
        onboarding: enOnboarding,
    },
    pt: {
        common: ptCommon,
        auth: ptAuth,
        dashboard: ptDashboard,
        bookings: ptBookings,
        entity: ptEntity,
        nav: ptNav,
        services: ptServices,
        platform: ptPlatform,
        admin: ptAdmin,
        professional: ptProfessional,
        settings: ptSettings,
        about: ptAbout,
        features: ptFeatures,
        pricing: ptPricing,
        onboarding: ptOnboarding,
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
            // Priority order for language detection
            order: [
                'localStorage',      // 1. User's manual selection (stored)
                'navigator',         // 2. Browser language
                'htmlTag',          // 3. HTML lang attribute
            ],
            caches: ['localStorage'],
            lookupLocalStorage: 'schedfy-language',
        },

        react: {
            useSuspense: false,
        },
    })

export default i18n