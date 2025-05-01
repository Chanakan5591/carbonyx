import type { Route } from "./+types/success";
import { getAuth } from "@clerk/react-router/ssr.server";

import { redirect } from "react-router";
import { stripe_kv } from "~/kv/stripe";
import { syncStripeDataToKV } from "~/utils/kv";

export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args);

  if (!auth.userId || !auth.sessionId || !auth.orgId) {
    throw redirect('/');
  }

  const stripeCustomerId = await stripe_kv.get(auth.orgId)

  if (stripeCustomerId) {
    await syncStripeDataToKV(stripeCustomerId)
  }
  return null
}

export default function SuccesCheckout() {
  return (
    <div>
      <span>Success!</span>
    </div>
  )
}
