import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const SECONDME_ENDPOINT = process.env.SECONDME_ENDPOINT || 'https://app.mindos.com/gate/lab';
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3001';

console.log('[Auth] Initializing with NEXTAUTH_URL:', NEXTAUTH_URL);

const SecondMeProvider = {
  id: "secondme",
  name: "SecondMe",
  type: "oauth",
  version: "2.0",
  clientId: process.env.SECONDME_CLIENT_ID,
  clientSecret: process.env.SECONDME_CLIENT_SECRET,
  // Explicit endpoints - no discovery
  authorization: {
    url: "https://go.second.me/oauth/",
    params: {
      scope: "user.info",
      response_type: "code",
      client_id: process.env.SECONDME_CLIENT_ID,
      redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/auth/callback/secondme`,
    },
  },
  token: {
    url: `${SECONDME_ENDPOINT}/api/oauth/token/code`,
    async request(context: any) {
      console.log('[SecondMe] Token request:', context.params);
      
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
      });

      const result = await response.json();
      console.log('[SecondMe] Token response:', result.code);

      if (result.code !== 0 || !result.data) {
        throw new Error(result.message || 'Token exchange failed');
      }

      const { accessToken, refreshToken, expiresIn, tokenType } = result.data;
      return {
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expiresIn,
          token_type: tokenType || 'Bearer',
        },
      };
    },
  },
  userinfo: {
    url: `${SECONDME_ENDPOINT}/api/secondme/user/info`,
    async request(context: any) {
      console.log('[SecondMe] Userinfo request');
      
      const response = await fetch(`${SECONDME_ENDPOINT}/api/secondme/user/info`, {
        headers: { Authorization: `Bearer ${context.tokens.access_token}` },
      });

      const result = await response.json();
      console.log('[SecondMe] Userinfo response:', result.code);

      if (result.code !== 0 || !result.data) {
        throw new Error(result.message || 'Failed to fetch user info');
      }

      return result.data;
    },
  },
  profile(profile: any) {
    console.log('[SecondMe] Profile:', profile.name);
    return { 
      id: profile.sub, 
      name: profile.name, 
      email: profile.email, 
      image: profile.picture, 
      secondMeId: profile.sub 
    };
  },
  checks: ["state"],
  // Disable OIDC discovery
  wellKnown: undefined,
  issuer: undefined,
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [SecondMeProvider as any],
  callbacks: {
    session: ({ session, token, user }) => ({
      ...session,
      user: { ...session.user, id: user.id },
    }),
    signIn: async ({ user, account, profile }) => {
      console.log('[NextAuth] SignIn callback:', { 
        email: user?.email, 
        userId: user?.id 
      });
      
      try {
        if (account && user?.id) {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              accessToken: account.access_token, 
              refreshToken: account.refresh_token,
              secondMeId: (profile as any)?.sub 
            },
          });
          console.log('[NextAuth] User tokens saved to DB');
        }
        return true;
      } catch (error: any) {
        console.error('[NextAuth] DB update error:', error.message);
        // Still allow sign in even if DB update fails
        return true;
      }
    },
    redirect: async ({ url, baseUrl }) => {
      console.log('[NextAuth] Redirect callback:', { url, baseUrl });
      // Always redirect to dashboard after sign in
      if (url.includes('/api/auth/callback') || url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`;
      }
      return url;
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  debug: true,
};