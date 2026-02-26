/** @type {import('next').NextConfig} */
const nextConfig = {
  // CloudBase 部署配置
  output: 'standalone',
  // 创建独立的可部署包
  trailingSlash: false,
  // 静态导出配置（如果需要全静态）
  // output: 'export',
  // distDir: '.next/standalone',
  
  // 环境变量配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
