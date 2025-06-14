/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for static HTML export for Capacitor
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Required for static export
  },
  // Ensure that Next.js doesn't use trailing slashes which can cause issues with Capacitor
  trailingSlash: false,
  // Disable unnecessary features for mobile app
  reactStrictMode: true,
};

export default nextConfig;
