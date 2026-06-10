/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cafecomhomensdedeus.com.br' },
    ],
  },
}

module.exports = nextConfig
