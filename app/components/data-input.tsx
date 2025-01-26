import { hstack, vstack } from "carbonyxation/patterns";

export default function DataInput() {
  return (
    <div
      className={hstack({
        gap: 2,
        bg: "white",
        border: "1px solid",
        borderColor: "neutral.400",
        rounded: "md",
      })}
    >
      <div
        className={vstack({
          gap: 1,
        })}
      >
        <span>Label</span>
        <input type="text" />
      </div>
    </div>
  );
}
