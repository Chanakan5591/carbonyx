import { css } from "carbonyxation/css";
import { flex, hstack, vstack } from "carbonyxation/patterns";
import { Outlet } from "react-router";
import SmallLogo from "~/assets/logo_64x.png";
import MenuItem from "../menuitem";

export default function Shell() {
  return (
    <div
      className={css({
        height: "svh",
        display: "flex",
        flexDirection: "column",
      })}
    >
      <div
        className={hstack({
          padding: "4",
          width: "full",
          bg: "white",
          borderBottom: "1px solid",
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
      </div>
      <div
        className={flex({
          w: "full",
          height: "full",
        })}
      >
        <div
          className={flex({
            flexDirection: "column",
            minW: "56",
            height: "full",
            bg: "white",
            borderRight: "1px solid",
            justifyContent: "space-between",
          })}
        >
          <div>
            <MenuItem text="Dashboard" icon="home" route="/dashboard" />
            <MenuItem
              text="Information"
              icon="information"
              route="/dashboard/info"
            />
            <MenuItem text="Location" route="/dashboard/location" />
            <MenuItem text="Vehicles" route="/dashboard/vehicles" />
            <MenuItem text="Scopes of Emissions" route="/dashboard/scopes" />
          </div>
          <div>
            <hr
              className={css({
                borderTop: "1px solid",
                borderTopColor: "neutral.400",
              })}
            />
            <MenuItem text="0% of footprint" icon="circle" />
            <MenuItem text="Help center" icon="question" />
            <MenuItem text="Settings" icon="gear" />
          </div>
        </div>
        <div
          className={css({
            flex: 1,
            overflow: "auto",
          })}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
