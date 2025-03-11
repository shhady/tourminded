/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'api.qrserver.com',
      'localhost',
      'placehold.co',
      'placekitten.com'
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig 