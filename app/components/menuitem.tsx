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
      prefetch="intent"
      className={hstack({
        gap: 2,
        padding: 2,
        cursor: "pointer",
        borderBottom: "1px solid",
        borderBottomColor: "neutral.400",
        position: "relative",
        overflow: "hidden",
        _before: {
          content: "''",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transition: "opacity 0.4s ease-in-out",
          // Show on active route
          opacity: currentRoute === route ? 1 : 0,
          bgGradient: "to-r",
          // Darker gradient for active route
          gradientFrom: "white",
          gradientVia: "accent.100",
          gradientTo: "accent.200",
        },
        _hover: {
          _before: {
            opacity: 1,
            bgGradient: "to-r",
            gradientFrom: "white",
            gradientVia: currentRoute === route ? "accent.100" : "accent.50",
            gradientTo: currentRoute === route ? "accent.200" : "accent.100",
          },
        },
      })}
    >
      <div
        className={flex({
          w: 6,
          zIndex: 1,
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
          zIndex: 1,
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
