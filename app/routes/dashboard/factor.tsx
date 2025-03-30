import { css } from "carbonyxation/css";
import { flex } from "carbonyxation/patterns";
import Table, { type Column } from "~/components/table";
import type { Route } from './+types/factor'
import { db } from "~/db/db";
import { factors } from "~/db/schema";

export async function loader(args: Route.LoaderArgs) {
  const availableFactors = await db.select().from(factors)

  return { availableFactors }
}

export default function FactorRoute({ loaderData }: Route.ComponentProps) {
  const columns: Column[] = [
    { key: "id", title: "ID", type: "number" },
    { key: "name", title: "Name", type: "string" },
    { key: "type", title: "Type", type: "string" },
    { key: "unit", title: "Unit", type: "string" },
    { key: "factor", title: "Factor", type: "number" }
  ];

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
        Custom Factors Configuration
      </span>
      <Table
        columns={columns}
        data={loaderData.availableFactors}
      />

    </div>
  )
}
