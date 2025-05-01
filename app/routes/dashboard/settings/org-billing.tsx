import { css } from "carbonyxation/css";
import { flex, hstack, vstack } from "carbonyxation/patterns";
import { button } from "~/components/button";
import InputEntry from "~/components/input-entry";
import type { Route } from "./+types/org-billing";

import { getAuth } from "@clerk/react-router/ssr.server";
import { createClerkClient } from "@clerk/backend";
import { env } from "~/env.server";

import { redirect } from "react-router";
import { useState } from "react";

export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)

  if (!auth.orgId) return redirect('/')

  const org = await createClerkClient({
    secretKey: env.CLERK_SECRET_KEY
  }).organizations.getOrganization({
    organizationId: auth.orgId
  })

  const billingEmail = org.privateMetadata.billingEmail as string

  return { billingEmail }
}

export async function action(args: Route.ActionArgs) {
  const auth = await getAuth(args)
  const formData = await args.request.formData()
  const billingEmail = formData.get('billing_email')

  if (!auth.orgId) return redirect('/')

  await createClerkClient({
    secretKey: env.CLERK_SECRET_KEY
  }).organizations.updateOrganizationMetadata(auth.orgId, {
    privateMetadata: {
      billingEmail: billingEmail
    }
  })
  console.log("SAVED!", billingEmail)
}

export default function OrganizationSetting({ loaderData }: Route.ComponentProps) {
  const [billingEmail, setBillingEmail] = useState(loaderData.billingEmail)
  return (
    <div
      className={flex({
        w: "full",
        p: 4,
        flexDirection: "column",
        gap: 4,
        h: "full",
      })}
    >
      <div className={hstack({
        justifyContent: "space-between"
      })}>
        <span
          className={css({
            fontSize: "2xl",
            fontWeight: "bold",
          })}
        >
          Organization Billing
        </span>
      </div>
      <form method="POST" className={flex({
        flexDir: 'column',
        width: 'full'
      })}>
        <InputEntry id="billing_email" name='billing_email' value={billingEmail} onChange={(_, value) => setBillingEmail(value)} label="Billing E-Mail Address" placeholder="billing@example.org" />
        <input type='submit' className={button({
          color: 'primary'
        })} value="Save" />
      </form>
    </div >
  )
}
