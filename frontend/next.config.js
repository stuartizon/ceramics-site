const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/store",
        destination: "/shop",
        permanent: true,
      },
    ]
  },
  // This workspace has its own package-lock.json (deliberately isolated
  // from the repo root's — see backend's react18/frontend's react19
  // split), so Next's root-inference heuristic sees two lockfiles and
  // guesses. Pin it explicitly.
  outputFileTracingRoot: __dirname,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        // Cloudflare R2's Public Development URL (r2.dev) — dev-only and
        // rate-limited, but it's what's currently configured as S3_FILE_URL
        // in the absence of a custom domain on the bucket.
        protocol: "https",
        hostname: "*.r2.dev",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
}

module.exports = nextConfig
