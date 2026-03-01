/** @type {import('next').NextConfig} */
const nextConfig = {
  // 注意：Vercel 部署时不需要 output: 'standalone'
  // Docker 部署时可以取消下面这行的注释
  // output: 'standalone',
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
