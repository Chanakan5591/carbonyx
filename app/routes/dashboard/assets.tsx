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
        We are working hard to get this going, but it's going to be great! In the meantime, please check out manual emissions pages for the current organization carbon emissions information
      </span>

    </div>
  );
}
