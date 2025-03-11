import { css } from "carbonyxation/css";
import { container, flex, hstack } from "carbonyxation/patterns";
import { button } from "./button";
import SmallLogo from "../assets/logo_64x.png";
import { Link } from "react-router";
import { SignedOut, SignInButton, SignUpButton } from "@clerk/react-router";

export default function LandingBar() {
  return (
    <nav
      className={css({
        padding: "4",
        position: "fixed",
        width: "full",
      })}
    >
      <div
        className={hstack({
          gap: "4",
          justify: "space-between",
        })}
      >
        <span
          className={flex({
            fontSize: "xl",
            fontWeight: "bold",
            alignItems: "center",
            gap: 2,
          })}
        >
          <img src={SmallLogo} alt="Carbonyx" width={32} />
          Carbonyx
        </span>
        <div
          className={hstack({
            gap: 2,
          })}
        >
          <button
            className={button({
              color: "secondary",
              variant: "outline",
            })}
          >
            Documentation
          </button>
          <button
            className={button({
              color: "secondary",
              variant: "outline",
            })}
          >
            Contact Us
          </button>
          <SignedOut>
            <SignUpButton>
              <button
                className={button({
                  color: "primary",
                })}
              >
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
