const path = require("path")

/** @type {import('next-i18next').UserConfig} */
const nextI18nextConfig = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ar"],
  },
  localePath: path.resolve("./public/locales"),
  reloadOnPrerender: process.env.NODE_ENV === "development",
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

module.exports = nextI18nextConfig
