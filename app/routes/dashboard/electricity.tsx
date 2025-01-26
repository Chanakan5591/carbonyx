import { css } from "carbonyxation/css";
import { flex } from "carbonyxation/patterns";
import { and, eq } from "drizzle-orm";
import Table from "~/components/table";
import { db } from "~/db/db";
import {
  collectedData,
  type CollectedData,
  type CollectedDataWithEmission,
} from "~/db/schema";
import type { Route } from "./+types/electricity";
import DataInput from "~/components/data-input";

export async function loader({ params }: Route.LoaderArgs) {
  const mockOrgId = "1";
  const electricity_usage = await db
    .select()
    .from(collectedData)
    .where(
      and(eq(collectedData.orgId, mockOrgId), eq(collectedData.factorId, 36)),
    );

  const electricity_usage_with_emission: CollectedDataWithEmission[] =
    electricity_usage.map((data) => ({
      ...data,
      totalEmission:
        Math.round((data.value * data.recordedFactor + Number.EPSILON) * 100) /
        100,
    }));

  return electricity_usage_with_emission;
}

export default function ElectricityInputPage({
  loaderData,
}: Route.ComponentProps) {
  const data = loaderData;

  const columns = [
    { key: "id", title: "ID", type: "number" },
    { key: "timestamp", title: "Timestamp", type: "timestamp" },
    { key: "value", title: "Value", type: "string", suffix: "kWh" },
    {
      key: "recordedFactor",
      title: "Recorded Factor",
      type: "number",
      suffix: "Kg CO₂e/kWh",
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
        Acme, Inc. Electricity Consumption
      </span>
      <DataInput />
      <Table columns={columns} data={data} />
    </div>
  );
}
