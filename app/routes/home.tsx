import { flex, hstack, vstack } from "carbonyxation/patterns";
import type { Route } from "./+types/home";
import Welcome from "../assets/welcome.png";
import { css } from "carbonyxation/css";
import { button } from "~/components/button";
import Logo from "../assets/logo.png";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div
      id="landing"
      className={hstack({
        justify: "space-between",
        alignItems: "center",
        h: "svh",
      })}
    >
      <div
        className={flex({
          width: "full",
          justify: "center",
          alignItems: "center",
        })}
      >
        <img
          src={Welcome}
          width="258rem"
          className={css({
            pos: "absolute",
          })}
        />
        <div
          className={vstack({
            zIndex: 10,
            mt: 4,
          })}
        >
          <span
            className={css({
              fontWeight: "semibold",
            })}
          >
            Carbonyx
          </span>
          <span
            className={css({
              maxW: "36ch",
              textAlign: "center",
              fontSize: "sm",
              fontWeight: "light",
            })}
          >
            Let us handle the accounting works, so you can focus on the future
          </span>
          <button className={button({ variant: "solid", color: "primary" })}>
            Get Started
          </button>
        </div>
      </div>
      <div
        className={flex({
          width: "full",
          gap: "4",
          justify: "center",
          alignItems: "center",
        })}
      >
        <div
          className={css({
            bg: "white",
            rounded: "full",
            padding: 8,
          })}
        >
          <img src={Logo} width="324rem" />
        </div>
      </div>
    </div>
  );
}
