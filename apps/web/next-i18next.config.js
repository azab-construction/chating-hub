module.exports = {
  i18n: {
    defaultLocale: "ar",
    locales: ["ar", "en", "fr"],
    localeDetection: false,
  },
  fallbackLng: {
    default: ["ar"],
  },
  debug: process.env.NODE_ENV === "development",
  reloadOnPrerender: process.env.NODE_ENV === "development",

  // RTL support
  interpolation: {
    escapeValue: false,
  },

  // Namespace separation
  ns: ["common", "auth", "chat", "settings", "billing", "integrations"],
  defaultNS: "common",

  // Additional configurations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
