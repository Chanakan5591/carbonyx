import { css } from "carbonyxation/css";
import { flex, hstack } from "carbonyxation/patterns";
import { Outlet, Link } from "react-router";
import SmallLogo from "~/assets/logo_64x.png";
import { MenuItem, MenuSection } from "../menuitem";
import { OrganizationSwitcher, UserButton } from "@clerk/react-router";

export default function Shell() {
  // Calculate the header height (assuming padding: "4" is 16px on each side, total 32px + assumed content height of 24px)
  const headerHeight = "65px"; // **Adjust this value to your actual header height**

  return (
    <div
      className={css({
        height: "100vh", // Use vh directly for clarity
      })}
    >
      <div
        className={hstack({
          padding: "4",
          width: "full",
          bg: "white",
          borderBottom: "1px solid",
          justifyContent: "space-between",
        })}
      >
        <Link to="/dashboard">
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
            <OrganizationSwitcher hidePersonal={true} />
          </span>
        </Link>
        <UserButton />
      </div>
      <div
        className={flex({
          w: "full",
          // Calculate the remaining height after subtracting the header
          height: `calc(100vh - ${headerHeight})`,
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
            overflowY: "auto",
          })}
        >
          <div>
            <MenuSection>
              <MenuItem text="Dashboard" icon="home" route="/dashboard" exact />
              <MenuItem text="Assets" icon="assets" route="/dashboard/assets" />
              <MenuItem
                text="Manual Emissions"
                icon="emissions"
                route="/dashboard/emissions"
              >
                <MenuItem text="Electricity" route="/dashboard/electricity" />
                <MenuItem
                  text="Stationary Fuels"
                  route="/dashboard/stationary_fuels"
                />
                <MenuItem
                  text="Transportation"
                  route="/dashboard/transportation"
                />
                <MenuItem text="Waste" route="/dashboard/waste" />
              </MenuItem>
            </MenuSection>
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
            overflowY: "auto", // Use overflowY for better control
          })}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
