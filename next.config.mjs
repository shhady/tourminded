import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  serverExternalPackages: ['mongoose'],
  images: {
    domains: ['res.cloudinary.com'],
  },
  // Suppress hydration warnings for fdprocessedid attributes
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
};

export default withNextIntl(nextConfig);
