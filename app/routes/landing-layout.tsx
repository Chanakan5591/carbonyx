import { Outlet } from "react-router";
import LandingBar from "~/components/landingbar";

export default function DashboardLayout() {
  return (
    <>
      <LandingBar />
      <Outlet />
    </>
  );
}
