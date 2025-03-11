import { css } from "carbonyxation/css";
import { flex, grid, vstack, hstack } from "carbonyxation/patterns";
import { button } from "~/components/button";
import Bg from "~/assets/authbg.jpg";
import SmallLogo from "~/assets/logo_64x.png";

export default function SignInPage() {
  return (
    <div
      className={flex({
        flexDir: "column",
        md: {
          flexDir: "row",
          justifyContent: "space-between"
        },
        height: "svh",
      })}
    >
      <div
        className={css({
          height: "12rem",
          md: {
            height: "full",
            maxHeight: "svh",
            width: "1/2",
          },
          padding: 2,
        })}
      >
        <img
          src={Bg}
          className={css({
            objectFit: "cover",
            objectPosition: "center",
            height: "12rem",
            md: {
              height: "full",
            },
            width: "full",
            rounded: "2xl",
          })}
        />
      </div>

      <div
        className={vstack({
          alignItems: "center",
          justifyContent: "space-between",
          paddingY: 16,
          gap: 12,
          md: {
            width: "1/2"
          }
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
          className={vstack({
            alignItems: "center",
            justifyContent: "center",
            height: "full",
            lineHeight: 1,
            width: "24rem",
          })}
        >
          <span
            className={vstack({
              fontFamily: "Times New Roman, serif",
              fontSize: "4xl",
              fontWeight: "semibold",
            })}
          >
            Welcome Back
          </span>
          <span>Enter your email and password to continue!</span>
          <div className={vstack({ marginTop: 8, gap: 4, width: "full" })}>
            <div
              className={flex({
                gap: 2,
                flexDir: "column",
                width: "full",
              })}
            >
              <label>Email</label>
              <input
                type="text"
                placeholder="Enter your Email"
                className={css({
                  border: 1,
                  borderStyle: "solid",
                  borderColor: "black",
                  padding: 2,
                  paddingX: 4,
                  rounded: "lg",
                  width: "full",
                  backgroundColor: "neutral.50",
                })}
              />
            </div>

            <div
              className={flex({
                gap: 2,
                flexDir: "column",
                width: "full",
              })}
            >
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your Password"
                className={css({
                  border: 1,
                  borderStyle: "solid",
                  borderColor: "black",
                  padding: 2,
                  paddingX: 4,
                  rounded: "lg",
                  width: "full",
                  backgroundColor: "neutral.50",
                })}
              />
            </div>
            <div
              className={hstack({
                justifyContent: "space-between",
                width: "full",
              })}
            >
              <div className={flex({ gap: 2 })}>
                <input type="checkbox" />
                <span>Remember me</span>
              </div>
              <span>Forgot Password?</span>
            </div>
            <button
              className={css({
                marginTop: 4,
                backgroundColor: "primary.300",
                color: "white",
                _hover: {
                  backgroundColor: "primary.400",
                },
                padding: 4,
                width: "full",
                rounded: "2xl",
              })}
            >
              Sign In
            </button>
          </div>
        </div>
        <span>
          Don't have an account?{" "}
          <span className={css({ fontWeight: "semibold" })}>Sign Up</span>
        </span>
      </div>
    </div>
  );
}
