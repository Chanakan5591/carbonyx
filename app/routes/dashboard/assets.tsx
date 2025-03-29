import { css } from "carbonyxation/css";
import { flex } from "carbonyxation/patterns";
import DataInput, { type DataInputProps, type AssetData } from "~/components/data-input";
import Table from "~/components/table";
import type { Route } from './+types/assets'
import { getAuth } from '@clerk/react-router/ssr.server'
import { assets, assetsData, factors } from "~/db/schema";
import { eq } from 'drizzle-orm'
import { db } from '~/db/db'
import { useNavigation, useActionData, useSubmit } from "react-router";
import { useEffect, useState } from "react";
import { toast } from 'sonner'

export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  const orgId = auth.orgId!

  // Get assets data with joins to get asset names
  const assets_usage = await db
    .select({
      id: assetsData.id,
      orgId: assetsData.orgId,
      asset_id: assetsData.asset_id,
      value: assetsData.value,
      recordedFactor: assetsData.recordedFactor,
      timestamp: assetsData.timestamp,
    })
    .from(assetsData)
    .where(eq(assetsData.orgId, orgId));

  // Get available assets with their emission factors
  const availableAssets: AssetData[] = await db.select({
    id: assets.id,
    name: assets.name,
    factor_name: factors.name,
    factor: factors.factor,
    unit: assets.unit,
    factor_unit: factors.unit,
    conversion_rate: assets.conversion_rate
  }).from(assets).innerJoin(factors, eq(factors.id, assets.factor_id));

  return {
    assets_usage,
    availableAssets
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  let result;

  if (intent === "add") {
    const asset_id = formData.get("asset_id")?.toString() || "";
    const value = Number(formData.get("value") || 0);
    const orgId = formData.get("orgId")?.toString() || "1";
    const recordedFactor = Number(formData.get("recordedFactor") || 0);

    result = await db
      .insert(assetsData)
      .values({
        asset_id,
        value,
        orgId,
        recordedFactor,
      })
      .returning();
  } else if (intent === "edit") {
    const id = formData.get("id")?.toString() || "";
    const asset_id = formData.get("asset_id")?.toString() || "";
    const value = Number(formData.get("value") || 0);
    const recordedFactor = Number(formData.get("recordedFactor") || 0);

    result = await db
      .update(assetsData)
      .set({
        asset_id,
        value,
        recordedFactor,
      })
      .where(eq(assetsData.id, id))
      .returning();
  } else if (intent === "delete") {
    const id = formData.get("id")?.toString() || "";

    result = await db
      .delete(assetsData)
      .where(eq(assetsData.id, id))
      .returning();
  } else {
    return { success: false, message: "Invalid intent" };
  }

  return {
    success: true,
    message: "Asset data updated successfully",
    updatedRecord: result?.[0],
    intent: intent,
  };
}

export default function Assets({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  // Enhanced table data with all the additional fields
  const [tableData, setTableData] = useState(
    loaderData.assets_usage.map(assetData => {
      const asset = loaderData.availableAssets.find(a => a.id === assetData.asset_id);
      return {
        ...assetData,
        assetName: asset?.name || "Unknown",
        unit: asset?.unit || "",
        conversionRate: asset?.conversion_rate || 1,
        factorName: asset?.factor_name || "Unknown",
        factorUnit: asset?.factor_unit || "",
        factor: asset?.factor || 0,
        totalEmission: asset ?
          Math.round((assetData.value * assetData.recordedFactor * asset.conversion_rate + Number.EPSILON) * 100) / 100 : 0
      };
    })
  );

  const [editingData, setEditingData] = useState<DataInputProps["editingData"]>(null);

  // Update table data when loader data changes
  useEffect(() => {
    setTableData(loaderData.assets_usage.map(assetData => {
      const asset = loaderData.availableAssets.find(a => a.id === assetData.asset_id);
      return {
        ...assetData,
        assetName: asset?.name || "Unknown",
        unit: asset?.unit || "",
        conversionRate: asset?.conversion_rate || 1,
        factorName: asset?.factor_name || "Unknown",
        factorUnit: asset?.factor_unit || "",
        factor: asset?.factor || 0,
        totalEmission: asset ?
          Math.round((assetData.value * assetData.recordedFactor * asset.conversion_rate + Number.EPSILON) * 100) / 100 : 0
      };
    }));
  }, [loaderData]);

  // Handle successful actions
  useEffect(() => {
    if (navigation.state === "idle" && actionData?.success) {
      toast.success(actionData.message || "Asset data updated successfully");

      if (actionData.intent === "add" && actionData.updatedRecord) {
        setTableData((prev) => {
          if (prev.find((item) => item.id === actionData.updatedRecord.id)) {
            return prev;
          }

          const asset = loaderData.availableAssets.find(a => a.id === actionData.updatedRecord.asset_id);
          const newRecord = {
            ...actionData.updatedRecord,
            assetName: asset?.name || "Unknown",
            unit: asset?.unit || "",
            conversionRate: asset?.conversion_rate || 1,
            factorName: asset?.factor_name || "Unknown",
            factorUnit: asset?.factor_unit || "",
            factor: asset?.factor || 0,
            totalEmission: asset ?
              Math.round((actionData.updatedRecord.value * actionData.updatedRecord.recordedFactor * asset.conversion_rate + Number.EPSILON) * 100) / 100 : 0
          };

          return [...prev, newRecord];
        });
      } else if (actionData.intent === "edit" && actionData.updatedRecord) {
        setTableData((prev) =>
          prev.map((item) => {
            if (item.id === actionData.updatedRecord.id) {
              const asset = loaderData.availableAssets.find(a => a.id === actionData.updatedRecord.asset_id);
              return {
                ...actionData.updatedRecord,
                assetName: asset?.name || "Unknown",
                unit: asset?.unit || "",
                conversionRate: asset?.conversion_rate || 1,
                factorName: asset?.factor_name || "Unknown",
                factorUnit: asset?.factor_unit || "",
                factor: asset?.factor || 0,
                totalEmission: asset ?
                  Math.round((actionData.updatedRecord.value * actionData.updatedRecord.recordedFactor * asset.conversion_rate + Number.EPSILON) * 100) / 100 : 0
              };
            }
            return item;
          })
        );
      } else if (actionData.intent === "delete" && actionData.updatedRecord) {
        setTableData((prev) =>
          prev.filter((item) => item.id !== actionData.updatedRecord.id)
        );
      }

      setEditingData(null); // Exit editing mode
    }
  }, [navigation.state, actionData, loaderData.availableAssets]);

  // Define table columns with proper types and suffixes
  const columns = [
    { key: "timestamp", title: "Timestamp", type: "timestamp" },
    { key: "assetName", title: "Asset Name", type: "string" },
    { key: "value", title: "Quantity", type: "number", suffix: (row: any) => row.value <= 1 ? row.unit : row.unit + "s" || "" },
    {
      key: "conversionRate",
      title: "Factor Unit Per Quantity",
      type: "number",
      suffix: (row: any) => `${row.factorUnit}/${row.unit}`
    },
    {
      key: "factor",
      title: "Factor",
      type: "number",
      suffix: (row: any) => `kgCO₂e/${row.factorUnit}`
    },
    { key: "totalEmission", title: "Total Emission", type: "number", suffix: "kg CO₂e" },
  ];

  const handleDataSubmit = async (newData: {
    asset_id: string;
    value: number | "";
    orgId: string;
    recordedFactor: number;
  }) => {
    const formData = new FormData();
    formData.append("intent", "add");
    formData.append("asset_id", newData.asset_id);
    formData.append(
      "value",
      newData.value === "" ? "0" : newData.value.toString()
    );
    formData.append("orgId", newData.orgId);
    formData.append("recordedFactor", newData.recordedFactor.toString());
    submit(formData, { method: "post" });
  };

  const handleEditStart = (editData: any) => {
    setEditingData({
      id: editData.id,
      asset_id: editData.asset_id,
      value: editData.value,
      recordedFactor: editData.recordedFactor
    });
  };

  const handleDataEdit = async (
    id: string,
    updatedData: {
      asset_id: string;
      value: number | "";
      recordedFactor: number;
    }
  ) => {
    const formData = new FormData();
    formData.append("intent", "edit");
    formData.append("id", id);
    formData.append("asset_id", updatedData.asset_id);
    formData.append(
      "value",
      updatedData.value === "" ? "0" : updatedData.value.toString()
    );
    formData.append("recordedFactor", updatedData.recordedFactor.toString());
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
        Assets Management
      </span>
      <DataInput
        inputType="asset"
        availableAssets={loaderData.availableAssets}
        onSubmit={handleDataSubmit}
        onEdit={handleDataEdit}
        editingData={editingData}
        allowEmptyValues={true}
      />
      <Table
        columns={columns}
        data={tableData}
        onEditStart={handleEditStart}
        onDelete={handleDelete}
      />
    </div>
  );
}
