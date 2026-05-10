/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production"
const staticExport = process.env.STATIC_EXPORT === "true"

const nextConfig = {
  output: staticExport ? "export" : undefined,
  trailingSlash: true,
  basePath: isProd && staticExport ? "/FinancialDashboard" : "",
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
