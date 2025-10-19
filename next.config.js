/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cloudflare Pages 静态导出配置
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 静态导出不支持某些功能
  trailingSlash: true,
}

module.exports = nextConfig
