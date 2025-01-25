import { css } from "carbonyxation/css";
import { flex, hstack } from "carbonyxation/patterns";
import { useLocation } from "react-router";
import { Link } from "react-router";

interface Props {
  icon?: "home" | "information" | "history" | "circle" | "question" | "gear";
  text: string;
  route?: string;
}

// using lucide-react
function getIcon(icon: Props["icon"]) {
  switch (icon) {
    case "home":
      return <i className="fa-solid fa-house"></i>;
    case "information":
      return <i className="fa-solid fa-circle-info" />;
    case "history":
      return <i className="fa-solid fa-circle-info" />;
    case "circle":
      return <i className="fa-light fa-circle" />;
    case "question":
      return <i className="fa-solid fa-circle-question" />;
    case "gear":
      return <i className="fa-solid fa-gear" />;
    default:
      return <span>&gt;</span>;
  }
}

export default function MenuItem({ icon, text, route }: Props) {
  const currentRoute = useLocation().pathname;
  return route ? (
    <Link
      to={route}
      className={hstack({
        gap: 2,
        padding: 2,
        cursor: "pointer",
        transition: "all 0.4s ease-in-out",
        borderBottom: "1px solid",
        borderBottomColor: "neutral.400",
        bgGradient: currentRoute === route ? "to-r" : "none",
        gradientFrom: "white",
        gradientTo: "accent.50",
      })}
    >
      <div
        className={flex({
          w: 6,
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "sm",
        })}
      >
        {getIcon(icon)}
      </div>
      <div
        className={css({
          fontSize: "sm",
          fontWeight: "medium",
        })}
      >
        {text}
      </div>
    </Link>
  ) : (
    <span
      className={hstack({
        gap: 2,
        padding: 2,
        cursor: "default",
        transition: "all 0.4s ease-in-out",
        borderBottom: "1px solid",
        borderBottomColor: "neutral.400",
        bgGradient: "none",
      })}
    >
      <div
        className={flex({
          w: 6,
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "sm",
        })}
      >
        {getIcon(icon)}
      </div>
      <div
        className={css({
          fontSize: "sm",
          fontWeight: "medium",
        })}
      >
        {text}
      </div>
    </span>
  );
}
