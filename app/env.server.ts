import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    TURSO_DATABASE_URL: z.string().url().startsWith("libsql://"),
    TURSO_AUTH_TOKEN: z.string(),
    CLERK_SECRET_KEY: z.string(),
    FLOWISE_CHATFLOW: z.string(),
    FLOWISE_API_HOST: z.string(),
    FLOWISE_API_KEY: z.string(),
    COUCH_USERNAME: z.string(),
    COUCH_PASSWORD: z.string(),
    TAVILY_API_KEY: z.string(),
    UPSTASH_PASSWORD: z.string(),
    UPSTASH_URL: z.string().url(),
    STRIPE_SECRET_KEY: z.string(),
    MONTHLY_STANDARD_PRICE_ID: z.string(),
    ANNUALLY_STANDARD_PRICE_ID: z.string()
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
