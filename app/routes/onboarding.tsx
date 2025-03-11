import { css } from "carbonyxation/css";
import { vstack } from "carbonyxation/patterns";

export default function Onboarding() {
  return (
    <div className={vstack({
      alignItems: "center",
      justifyContent: "center",
      height: "svh"
    })}>
      <span className={css({
        fontSize: 24
      })}>Onboarding</span>
    </div>
  )
}
