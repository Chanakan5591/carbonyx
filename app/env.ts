import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    TURSO_DATABASE_URL: z.string().url().startsWith("libsql://"),
    TURSO_AUTH_TOKEN: z.string(),
    CLERK_SECRET_KEY: z.string(),
  },
  clientPrefix: "VITE_",
  client: {},

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
