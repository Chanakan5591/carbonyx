import { css } from "carbonyxation/css";
import { vstack } from "carbonyxation/patterns";

export default function Information() {
  return (
    <div
      className={vstack({
        justifyContent: "center",
        alignItems: "center",
        height: "100%",

        gap: 2,
      })}
    >
      <span
        className={css({
          fontSize: 24,
          fontWeight: "semibold",
        })}
      >
        Coming Soon! 🚀
      </span>
      <span
        className={css({
          fontSize: 12,
          fontWeight: "thin",
        })}
      >
        We are working hard (But mostly hardly working 😅)
      </span>
    </div>
  );
}
