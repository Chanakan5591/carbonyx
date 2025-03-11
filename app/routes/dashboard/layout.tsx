import { Outlet } from "react-router";
import Shell from "~/components/dashboard/shell";
import type { Route } from "./+types/layout";
import { redirect, useNavigate } from 'react-router'
import { getAuth } from '@clerk/react-router/ssr.server'
import { useOrganizationList } from "@clerk/react-router";
import { useEffect } from "react";

export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)

  if (!auth.sessionId) {
    return redirect('/signin')
  }
  return null
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const orgList = useOrganizationList({ userMemberships: true });

  useEffect(() => {
    if (!orgList.isLoaded || orgList.userMemberships.isFetching) return

    console.log(orgList.userMemberships.count)

    if (!orgList.setActive || orgList.userMemberships.count === 0) {
      navigate("/onboarding");
      return;
    }

    orgList.setActive({
      organization: orgList.userMemberships.data[0].organization,
    });

  }, [orgList.isLoaded, orgList.userMemberships.isFetching]);

  return (
    <>
      <Shell />
    </>
  );
}
