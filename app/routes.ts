import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/landing-layout.tsx", [index("routes/home.tsx")]),
  route("/signin/*", "routes/sign-in.tsx"),
  route("/signup/*", "routes/sign-up.tsx"),
  route("/api/flowise/*", "routes/api/flowise.tsx"),
  route("/onboarding", "routes/onboarding.tsx"),
  ...prefix("/dashboard", [
    layout("routes/dashboard/layout.tsx", [
      route("/", "routes/dashboard/dashboard.tsx"),
      route("/assets", "routes/dashboard/assets.tsx"),
      route("/info", "routes/dashboard/information.tsx"),
      route("/electricity", "routes/dashboard/electricity.tsx"),
      route("/stationary_fuels", "routes/dashboard/stationary_fuel.tsx"),
      route("/transportation", "routes/dashboard/transportation.tsx"),
      route("/waste", "routes/dashboard/waste.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
