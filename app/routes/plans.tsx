import { stripe_kv } from "~/kv/stripe"
import type { Route } from "./+types/plans"
import { getAuth } from '@clerk/react-router/ssr.server'

import { redirect } from 'react-router'
import { stripe } from "~/stripe"
import { env } from "~/env.server"

import { createClerkClient } from "@clerk/backend"
import { useState } from "react"
import { button } from "~/components/button"
import { getUrl } from "~/utils/utilities"

export async function action(args: Route.ActionArgs) {
  const auth = await getAuth(args)
  const formData = await args.request.formData();
  const plan = formData.get('plan') as 'standard';
  const recurring = formData.get('recurring') as 'monthly' | 'annually'

  const priceID = plan === 'standard' && recurring === 'annually' ? env.ANNUALLY_STANDARD_PRICE_ID : env.MONTHLY_STANDARD_PRICE_ID // expand later

  if (!auth.userId || !auth.sessionId || !auth.orgId) {
    return redirect('/signin')
  }

  const user = await createClerkClient({
    secretKey: env.CLERK_SECRET_KEY
  }).users.getUser(auth.userId)

  let stripeCustomerId = await stripe_kv.get(`stripe:org:${auth.orgId}`)

  if (!stripeCustomerId) {
    const newCustomer = await stripe.customers.create({
      email: user.primaryEmailAddress?.emailAddress,
      metadata: {
        userId: auth.userId,
        orgId: auth.orgId
      }
    })

    await stripe_kv.set(`stripe:user:${auth.userId}`, newCustomer.id)
    stripeCustomerId = newCustomer.id
  }

  let session
  try {
    session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      success_url: getUrl('/success'),
      line_items: [{ price: priceID, quantity: 1 }],
      mode: "subscription",
      cancel_url: getUrl("/"),
      subscription_data: {
        metadata: {
          userId: auth.userId
        }
      },
      allow_promotion_codes: true
    })
  } catch (error) {
    console.error("Error creating checkout session: ", error)
    throw new Error("Something went wrong :( Please refresh and try again")
  }

  return redirect(session.url!, 303)
}

export default function Plans() {
  const [recurringType, setRecurringType] = useState<'annually' | 'monthly'>('annually')
  const handleCheckoutPlan = (plan: 'standard') => {
    const form = document.createElement('form');
    form.method = 'POST';

    const actionInput = document.createElement('input');
    actionInput.type = 'hidden';
    actionInput.name = 'plan';
    actionInput.value = plan;
    form.appendChild(actionInput);

    const notebookIdInput = document.createElement('input');
    notebookIdInput.type = 'hidden';
    notebookIdInput.name = 'recurring';
    notebookIdInput.value = recurringType;
    form.appendChild(notebookIdInput);

    document.body.appendChild(form);
    form.submit();
    form.remove();
  }
  return (
    <>
      <button className={button({
        color: 'primary'
      })} onClick={() => handleCheckoutPlan('standard')}>Checkout</button>
    </>
  )
}
