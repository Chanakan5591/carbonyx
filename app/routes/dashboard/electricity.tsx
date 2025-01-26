import { css } from "carbonyxation/css";
import { flex } from "carbonyxation/patterns";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import { and, eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import DataInput, { type DataInputProps } from "~/components/data-input";
import Table from "~/components/table";
import { db } from "~/db/db";
import {
  collectedData,
  factors,
  type CollectedDataWithEmission,
} from "~/db/schema";
import type { Route } from "./+types/electricity";

const mockOrgId = "1";
const factorType = "electricity"; // Set the factor type here

export async function loader({ request }: Route.LoaderArgs) {
  // Fetch initial data
  const electricity_usage = await db
    .select()
    .from(collectedData)
    .where(
      and(
        eq(collectedData.orgId, mockOrgId),
        eq(collectedData.factorId, 36), // You might need a better way to filter initial data
      ),
    );

  // Fetch available factors with 'factor' value
  const availableFactors = await db
    .select({
      id: factors.id,
      name: factors.name,
      unit: factors.unit,
      type: factors.type,
      subType: factors.subType,
      factor: factors.factor, // Include the factor value
    })
    .from(factors);

  // Calculate total emission using the fetched factor
  const electricity_usage_with_emission: CollectedDataWithEmission[] =
    electricity_usage.map((data) => {
      const factor =
        availableFactors.find((f) => f.id === data.factorId)?.factor || 0;
      return {
        ...data,
        recordedFactor: factor,
        totalEmission:
          Math.round((data.value * factor + Number.EPSILON) * 100) / 100,
      };
    });

  return { electricity_usage_with_emission, availableFactors };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "add") {
    const factorId = Number(formData.get("factorId"));
    const value = Number(formData.get("value"));
    const orgId = formData.get("orgId")?.toString() || "1";
    const factorValue = Number(formData.get("factorValue"));

    // Add data to the database (no need for recordedFactor)
    await db.insert(collectedData).values({
      factorId,
      value,
      orgId,
      recordedFactor: factorValue,
    });
  } else if (intent === "edit") {
    const id = formData.get("id")?.toString();
    const factorId = Number(formData.get("factorId"));
    const value = Number(formData.get("value"));

    if (!id) throw new Error("Missing ID for editing data");

    // Update data in the database
    await db
      .update(collectedData)
      .set({
        factorId,
        value,
      })
      .where(eq(collectedData.id, id));
  } else if (intent === "delete") {
    const id = formData.get("id")?.toString();

    if (!id) throw new Error("Missing ID for deleting data");

    // Delete data from the database
    await db.delete(collectedData).where(eq(collectedData.id, id));
  } else {
    return { success: false, message: "Invalid intent" };
  }

  return { success: true, message: "Data updated successfully" };
}

export default function ElectricityInputPage() {
  const { electricity_usage_with_emission, availableFactors } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [data, setData] = useState(electricity_usage_with_emission);
  const [editingData, setEditingData] =
    useState<DataInputProps["editingData"]>(null);

  useEffect(() => {
    if (navigation.state === "idle" && actionData?.success) {
      // Refresh data after successful action
      setData((d) => {
        return d.map((item) => {
          const factor =
            availableFactors.find((f) => f.id === item.factorId)?.factor || 0;

          return {
            ...item,
            recordedFactor: factor,
            totalEmission:
              Math.round((item.value * factor + Number.EPSILON) * 100) / 100,
          };
        });
      });
      setEditingData(null); // Exit editing mode
    }
  }, [navigation, actionData]);

  const columns = [
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

  const handleDataSubmit = async (newData: {
    factorId: number;
    value: number;
    orgId: string;
    factorValue: number;
  }) => {
    const formData = new FormData();
    formData.append("intent", "add");
    formData.append("factorId", newData.factorId.toString());
    formData.append("value", newData.value.toString());
    formData.append("orgId", newData.orgId.toString());
    formData.append("factorValue", newData.factorValue.toString());
    submit(formData, { method: "post" });
  };

  const handleEditStart = (editData: {
    id: string;
    factorId: number;
    value: number;
    recordedFactor: number;
  }) => {
    setEditingData(editData);
  };

  const handleDataEdit = async (
    id: string,
    updatedData: {
      factorId: number;
      value: number;
    },
  ) => {
    const formData = new FormData();
    formData.append("intent", "edit");
    formData.append("id", id);
    formData.append("factorId", updatedData.factorId.toString());
    formData.append("value", updatedData.value.toString());
    submit(formData, { method: "post" });
  };

  const handleDelete = (id: string) => {
    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("id", id);
    submit(formData, { method: "post" });
  };

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
      <DataInput
        availableFactors={availableFactors}
        onSubmit={handleDataSubmit}
        onEdit={handleDataEdit}
        editingData={editingData}
        factorType={factorType}
      />
      <Table
        columns={columns}
        data={data}
        onEditStart={handleEditStart} // Pass onEditStart to Table
        onDelete={handleDelete} // Pass onDelete to Table
      />
    </div>
  );
}
