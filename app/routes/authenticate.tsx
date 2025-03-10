import { useStytchMemberSession } from "@stytch/nextjs/b2b";
import { css } from "carbonyxation/css";
import { useNavigate } from "react-router";
import { LoginOrSignupDiscoveryForm } from "~/components/auth";

export default function Authenticate() {
  const navigate = useNavigate();
  const { session } = useStytchMemberSession();

  if (session) {
    return navigate("/dashboard");
  }

  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "svh",
      })}
    >
      <LoginOrSignupDiscoveryForm />
    </div>
  );
}
