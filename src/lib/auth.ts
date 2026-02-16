import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const SECONDME_ENDPOINT = process.env.SECONDME_ENDPOINT || 'https://app.mindos.com/gate/lab'
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3001'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "secondme",
      name: "SecondMe",
      type: "oauth",
      version: "2.0",
      authorization: {
        url: "https://go.second.me/oauth/",
        params: {
          scope: "user.info",
          response_type: "code",
        }
      },
      token: {
        url: `${SECONDME_ENDPOINT}/api/oauth/token/code`,
        async request(context) {
          console.log('[SecondMe Token] Starting token exchange...')
          console.log('[SecondMe Token] Code:', context.params.code?.substring(0, 20) + '...')
          
          try {
            const response = await fetch(`${SECONDME_ENDPOINT}/api/oauth/token/code`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: context.params.code,
                redirect_uri: `${NEXTAUTH_URL}/api/auth/callback/secondme`,
                client_id: process.env.SECONDME_CLIENT_ID!,
                client_secret: process.env.SECONDME_CLIENT_SECRET!,
              }),
            })

            const result = await response.json()
            console.log('[SecondMe Token] Response code:', result.code)
            console.log('[SecondMe Token] Response message:', result.message)
            
            if (result.code !== 0 || !result.data) {
              console.error('[SecondMe Token] Failed:', result.message)
              throw new Error(result.message || 'Token exchange failed')
            }

            const { accessToken, refreshToken, expiresIn, tokenType } = result.data
            console.log('[SecondMe Token] Success! Got access token.')
            
            return {
              tokens: {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_in: expiresIn,
                token_type: tokenType || 'Bearer',
              },
            }
          } catch (error: any) {
            console.error('[SecondMe Token] Error:', error.message)
            throw error
          }
        },
      },
      userinfo: {
        url: `${SECONDME_ENDPOINT}/api/secondme/user/info`,
        async request(context) {
          console.log('[SecondMe UserInfo] Fetching user info...')
          
          try {
            const response = await fetch(`${SECONDME_ENDPOINT}/api/secondme/user/info`, {
              headers: { Authorization: `Bearer ${context.tokens.access_token}` },
            })

            const result = await response.json()
            console.log('[SecondMe UserInfo] Response code:', result.code)

            if (result.code !== 0 || !result.data) {
              console.error('[SecondMe UserInfo] Failed:', result.message)
              throw new Error(result.message || 'Failed to fetch user info')
            }

            console.log('[SecondMe UserInfo] Success! User:', result.data.name)
            return result.data
          } catch (error: any) {
            console.error('[SecondMe UserInfo] Error:', error.message)
            throw error
          }
        },
      },
      profile(profile) {
        console.log('[SecondMe Profile] Profile data:', {
          sub: profile.sub,
          name: profile.name,
          email: profile.email,
        })
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          secondMeId: profile.sub,
        }
      },
      // 禁用 state 检查，因为 SecondMe 可能不返回 state
      checks: [],
      clientId: process.env.SECONDME_CLIENT_ID,
      clientSecret: process.env.SECONDME_CLIENT_SECRET,
    } as any,
  ],
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // 允许返回到 dashboard
      if (url.startsWith(baseUrl)) {
        return url
      }
      return baseUrl
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
}
