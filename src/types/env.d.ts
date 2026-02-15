declare namespace NodeJS {
  interface ProcessEnv {
    SECONDME_CLIENT_ID: string;
    SECONDME_CLIENT_SECRET: string;
    SECONDME_ENDPOINT: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    DATABASE_URL: string;
  }
}