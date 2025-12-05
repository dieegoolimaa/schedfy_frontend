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
import enFinancial from './locales/en/financial.json'
import ptFinancial from './locales/pt/financial.json'
import enSubscription from './locales/en/subscription.json'
import ptSubscription from './locales/pt/subscription.json'
import enAnalytics from './locales/en/analytics.json'
import ptAnalytics from './locales/pt/analytics.json'
import enClients from './locales/en/clients.json'
import ptClients from './locales/pt/clients.json'
import enPayments from './locales/en/payments.json'
import ptPayments from './locales/pt/payments.json'
import enPackages from './locales/en/packages.json'
import ptPackages from './locales/pt/packages.json'
import enHome from './locales/en/home.json'
import ptHome from './locales/pt/home.json'
import enIntegrations from './locales/en/integrations.json'
import ptIntegrations from './locales/pt/integrations.json'
import enReviews from './locales/en/reviews.json'
import ptReviews from './locales/pt/reviews.json'
import enTeam from './locales/en/team.json'
import ptTeam from './locales/pt/team.json'
import enProfessionals from './locales/en/professionals.json'
import ptProfessionals from './locales/pt/professionals.json'
import enNotifications from './locales/en/notifications.json'
import ptNotifications from './locales/pt/notifications.json'
import enContact from './locales/en/contact.json'
import ptContact from './locales/pt/contact.json'
import enInvitation from './locales/en/invitation.json'
import ptInvitation from './locales/pt/invitation.json'
import enUpgrade from './locales/en/upgrade.json'
import ptUpgrade from './locales/pt/upgrade.json'
import enPublicBooking from './locales/en/publicBooking.json'
import ptPublicBooking from './locales/pt/publicBooking.json'
import enEarnings from './locales/en/earnings.json'
import ptEarnings from './locales/pt/earnings.json'
import enAiPremium from './locales/en/aiPremium.json'
import ptAiPremium from './locales/pt/aiPremium.json'
import enCommissions from './locales/en/commissions.json'
import ptCommissions from './locales/pt/commissions.json'

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
        financial: enFinancial,
        subscription: enSubscription,
        analytics: enAnalytics,
        clients: enClients,
        payments: enPayments,
        packages: enPackages,
        home: enHome,
        integrations: enIntegrations,
        reviews: enReviews,
        team: enTeam,
        professionals: enProfessionals,
        notifications: enNotifications,
        contact: enContact,
        invitation: enInvitation,
        upgrade: enUpgrade,
        publicBooking: enPublicBooking,
        earnings: enEarnings,
        aiPremium: enAiPremium,
        commissions: enCommissions,
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
        financial: ptFinancial,
        subscription: ptSubscription,
        analytics: ptAnalytics,
        clients: ptClients,
        payments: ptPayments,
        packages: ptPackages,
        home: ptHome,
        integrations: ptIntegrations,
        reviews: ptReviews,
        team: ptTeam,
        professionals: ptProfessionals,
        notifications: ptNotifications,
        contact: ptContact,
        invitation: ptInvitation,
        upgrade: ptUpgrade,
        publicBooking: ptPublicBooking,
        earnings: ptEarnings,
        aiPremium: ptAiPremium,
        commissions: ptCommissions,
    },
}

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: false,

        // Default namespace when using t() without prefix
        defaultNS: 'common',

        // All available namespaces
        ns: ['common', 'auth', 'dashboard', 'bookings', 'entity', 'nav', 'services', 'platform', 'admin', 'professional', 'settings', 'about', 'features', 'pricing', 'onboarding', 'financial', 'subscription', 'analytics', 'clients', 'payments', 'packages', 'home', 'integrations', 'reviews', 'team', 'professionals', 'notifications', 'contact', 'invitation', 'upgrade', 'publicBooking', 'earnings', 'aiPremium', 'commissions'],

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