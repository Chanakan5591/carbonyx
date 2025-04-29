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
    TAVILY_API_KEY: z.string()
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
