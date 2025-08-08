/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Allow production builds to succeed even if there are TS errors.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
