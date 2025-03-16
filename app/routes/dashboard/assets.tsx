import { css } from "carbonyxation/css";
import { flex } from "carbonyxation/patterns";
import DataInput from "~/components/data-input";

export default function Assets() {
  return (
    <div
      className={flex({
        w: "full",
        p: 4,
        flexDirection: "column",
        gap: 4,
        h: "full",
      })}
    >
      <span
        className={css({
          fontSize: "xl",
          fontWeight: "bold",
        })}
      >
        Assets Management
      </span>

    </div>
  );
}
