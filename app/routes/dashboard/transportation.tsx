import { css } from "carbonyxation/css";
import { flex } from "carbonyxation/patterns";
import { and, eq } from "drizzle-orm";
import Table from "~/components/table";
import { db } from "~/db/db";
import {
  collectedData,
  factors,
  type CollectedData,
  type CollectedDataWithEmission,
} from "~/db/schema";
import type { Route } from "./+types/electricity";

export async function loader({ params }: Route.LoaderArgs) {
  const mockOrgId = "1";
  const transportationsUsage = await db
    .select()
    .from(collectedData)
    .innerJoin(factors, eq(collectedData.factorId, factors.id))
    .where(eq(factors.type, "transportation"));

  type SFUsageWithEmission = (typeof transportationsUsage)[number] & {
    totalEmission: number;
  };

  const sf_usage_with_emission: SFUsageWithEmission[] =
    transportationsUsage.map((data) => ({
      ...data,
      totalEmission:
        Math.round(
          (data.collected_data.value * data.collected_data.recordedFactor +
            Number.EPSILON) *
            100,
        ) / 100,
    }));

  return sf_usage_with_emission.map((item) => {
    return {
      ...item.collected_data,
      type: item.factors.name,
      totalEmission: item.totalEmission,
    };
  });
}

export default function TransportationInputPage({
  loaderData,
}: Route.ComponentProps) {
  const data = loaderData;

  const columns = [
    { key: "id", title: "ID", type: "number" },
    { key: "timestamp", title: "Timestamp", type: "timestamp" },
    { key: "type", title: "Type", type: "string" },
    { key: "value", title: "Value", type: "string", suffix: "tkm" },
    {
      key: "recordedFactor",
      title: "Recorded Factor",
      type: "number",
      suffix: "Kg CO₂e/tkm",
    },
    {
      key: "totalEmission",
      title: "Total Emission",
      type: "number",
      suffix: "Kg CO₂e",
    },
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
        Acme, Inc. Transportation Consumption
      </span>
      <Table columns={columns} data={data} />
    </div>
  );
}
