/** @type {import('next').NextConfig} */
const withSerwistInit = require('@serwist/next').default;

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: true,
});

module.exports = withSerwist({
  reactStrictMode: true,
  images: {
    domains: [],
  },
});
