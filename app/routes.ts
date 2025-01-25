import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/landing-layout.tsx", [index("routes/home.tsx")]),
  ...prefix("/dashboard", [
    layout("routes/dashboard/layout.tsx", [
      route("/", "routes/dashboard/dashboard.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
