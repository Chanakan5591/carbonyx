import Redis from "ioredis";
import { env } from "~/env.server";

const stripe_kv = new Redis(
  `rediss://default:${env.UPSTASH_PASSWORD}@${env.UPSTASH_URL}`,
);

export { stripe_kv };
