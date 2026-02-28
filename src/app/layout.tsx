import type { Metadata } from 'next'
import { Noto_Sans_SC } from 'next/font/google'
import './globals.css'

const notoSans = Noto_Sans_SC({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Xenos - AI Agent 身份标识协议',
  description: '一契立信，万物可协。Xenos 是一个基于可验证承诺证明（VCA）的 AI Agent 信任协议平台，将口头承诺转化为可验证的数字凭证。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
