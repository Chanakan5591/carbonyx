import { useAuth } from "@clerk/react-router";
import { css } from "carbonyxation/css";
import { flex } from "carbonyxation/patterns";
import React, { useState, useEffect, useRef } from "react";

export interface FactorData {
  id: number;
  name: string;
  unit: string;
  type: string;
  subType: string;
  factor: number;
}

export interface AssetData {
  id: string;
  name: string;
  factor_id: number;
  unit: string;
  conversion_rate: number;
}

export interface DataInputProps {
  availableFactors: FactorData[];
  availableAssets?: AssetData[];
  onSubmit: (data: {
    factorId: number;
    value: number;
    orgId: string;
    factorValue: number;
    isAssetInput?: boolean;
    assetId?: string;
    assetCount?: number;
  }) => Promise<void>;
  onEdit: (
    id: string,
    data: {
      factorId: number;
      value: number;
      isAssetInput?: boolean;
      assetId?: string;
      assetCount?: number;
    },
  ) => Promise<void>;
  editingData?: {
    id: string;
    factorId: number;
    value: number;
    isAssetInput?: boolean;
    assetId?: string;
    assetCount?: number;
  } | null;
  factorType: string;
  allowEmptyValues?: boolean;
  inputType: "factor" | "asset" | "both"; // Changed from inputMode to inputType
}

const DataInput = ({
  availableFactors,
  availableAssets = [],
  onSubmit,
  onEdit,
  editingData = null,
  factorType,
  allowEmptyValues = false,
  inputType = "both", // Changed from inputMode to inputType
}: DataInputProps) => {
  // Track whether we're in factor input or asset input mode
  const [mode, setMode] = useState<"factor" | "asset">( // Changed from "direct" to "factor"
    editingData?.isAssetInput
      ? "asset"
      : (inputType === "asset" ? "asset" : "factor")
  );

  // Factor input state
  const [factorId, setFactorId] = useState<number>(
    editingData?.factorId || availableFactors[0]?.id || 0,
  );
  const [value, setValue] = useState<number>(editingData?.value || 0);
  const [inputValue, setInputValue] = useState<string>(editingData?.value?.toString() || "0");

  // Asset input state
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    editingData?.assetId || availableAssets[0]?.id || "",
  );
  const [assetCount, setAssetCount] = useState<number>(editingData?.assetCount || 0);
  const [assetCountInput, setAssetCountInput] = useState<string>(
    editingData?.assetCount?.toString() || "0"
  );

  const hasEditingDataChanged = useRef(false);

  // Filter factors by type for factor input mode
  const filteredFactors = availableFactors.filter(
    (factor) => factor.type === factorType,
  );

  // Filter assets by linked factor type
  const filteredAssets = availableAssets.filter((asset) => {
    const linkedFactor = availableFactors.find(f => f.id === asset.factor_id);
    return linkedFactor && linkedFactor.type === factorType;
  });

  // Get details of selected factor/asset
  const selectedFactor = filteredFactors.find(factor => factor.id === factorId);
  const selectedAsset = filteredAssets.find(asset => asset.id === selectedAssetId);

  // For asset mode, determine the linked factor and conversion details
  const assetLinkedFactorId = selectedAsset?.factor_id;
  const assetLinkedFactor = assetLinkedFactorId
    ? availableFactors.find(factor => factor.id === assetLinkedFactorId)
    : undefined;
  const assetConversionRate = selectedAsset?.conversion_rate || 1;

  useEffect(() => {
    // Only update the states if editingData changes for the first time
    if (editingData && !hasEditingDataChanged.current) {
      if (editingData.isAssetInput) {
        setMode("asset");
        setSelectedAssetId(editingData.assetId || "");
        setAssetCount(editingData.assetCount || 0);
        setAssetCountInput(editingData.assetCount?.toString() || "0");
      } else {
        setMode("factor");
        setFactorId(editingData.factorId);
        setValue(editingData.value);
        setInputValue(editingData.value.toString());
      }
      hasEditingDataChanged.current = true; // Prevent further resetting
    }
  }, [editingData]);

  useEffect(() => {
    // Update factorId if the current factorId is not in the filteredFactors
    if (
      mode === "factor" &&
      !filteredFactors.some((factor) => factor.id === factorId) &&
      filteredFactors.length > 0
    ) {
      setFactorId(filteredFactors[0].id);
    }
    // Update selectedAssetId if not in filteredAssets
    if (
      mode === "asset" &&
      !filteredAssets.some((asset) => asset.id === selectedAssetId) &&
      filteredAssets.length > 0
    ) {
      setSelectedAssetId(filteredAssets[0].id);
    }
  }, [filteredFactors, filteredAssets, mode]);

  const auth = useAuth();
  const orgId = auth.orgId!;

  // Get factor values based on input mode
  const factorValue = selectedFactor?.factor || 0;
  const assetFactorValue = assetLinkedFactor?.factor || 0;

  // Calculate emissions for preview
  const calculatedFactorEmission = Math.round(((value * factorValue) + Number.EPSILON) * 100) / 100;
  const convertedAssetValue = assetCount * assetConversionRate;
  const calculatedAssetEmission = Math.round(((convertedAssetValue * assetFactorValue) + Number.EPSILON) * 100) / 100;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (mode === "factor") {
      if (editingData) {
        await onEdit(editingData.id, {
          factorId,
          value,
          isAssetInput: false
        });
      } else {
        await onSubmit({
          factorId,
          value,
          orgId,
          factorValue,
          isAssetInput: false
        });
      }
    } else { // asset mode
      if (!selectedAsset) return; // Safety check

      if (editingData) {
        await onEdit(editingData.id, {
          factorId: assetLinkedFactorId || 0,
          value: convertedAssetValue,
          isAssetInput: true,
          assetId: selectedAssetId,
          assetCount
        });
      } else {
        await onSubmit({
          factorId: assetLinkedFactorId || 0,
          value: convertedAssetValue,
          orgId,
          factorValue: assetFactorValue,
          isAssetInput: true,
          assetId: selectedAssetId,
          assetCount
        });
      }
    }

    // Reset form after submission
    if (mode === "factor") {
      setFactorId(filteredFactors[0]?.id || 0);
      setValue(0);
      setInputValue("0");
    } else {
      setSelectedAssetId(filteredAssets[0]?.id || "");
      setAssetCount(0);
      setAssetCountInput("0");
    }

    hasEditingDataChanged.current = false; // Reset editing tracking
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow empty string during editing
    setInputValue(newValue);

    // Update the actual value only if it's a valid number
    if (newValue === "" || newValue === "-") {
      if (allowEmptyValues) {
        setValue(newValue === "" ? "" as any : 0);
      } else {
        setValue(0); // Temporarily set to 0, but keep input field as empty
      }
    } else {
      setValue(Number(newValue));
    }
  };

  const handleAssetCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAssetCountInput(newValue);

    if (newValue === "" || newValue === "-") {
      if (allowEmptyValues) {
        setAssetCount(newValue === "" ? "" as any : 0);
      } else {
        setAssetCount(0);
      }
    } else {
      setAssetCount(Number(newValue));
    }
  };

  const handleInputBlur = () => {
    // If field is empty or just a minus sign when focus is lost, set to 0
    if (inputValue === "" || inputValue === "-") {
      setInputValue("0");
      setValue(0);
    }
  };

  const handleAssetCountBlur = () => {
    if (assetCountInput === "" || assetCountInput === "-") {
      setAssetCountInput("0");
      setAssetCount(0);
    }
  };

  // Render the appropriate form based on inputType
  const renderFactorForm = () => (
    <>
      <label htmlFor="factor">
        Factor:
        <select
          id="factor"
          value={factorId}
          onChange={(e) => setFactorId(Number(e.target.value))}
          className={css({
            display: "block",
            width: "full",
            p: 2,
            border: "1px solid",
            borderColor: "neutral.300",
            borderRadius: "md",
          })}
        >
          {filteredFactors.map((factor) => (
            <option key={factor.id} value={factor.id}>
              {factor.name} ({factor.subType}) - {factor.unit}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="value">
        Value ({selectedFactor?.unit || ""}):
        <input
          type="text"
          id="value"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          inputMode="numeric"
          pattern="-?[0-9]*\.?[0-9]*"
          className={css({
            display: "block",
            width: "full",
            p: 2,
            border: "1px solid",
            borderColor: "neutral.300",
            borderRadius: "md",
          })}
        />
      </label>
      {value > 0 && (
        <div className={css({ fontSize: "sm", color: "gray.600" })}>
          Estimated emissions: {calculatedFactorEmission} Kg CO₂e
        </div>
      )}
    </>
  );

  const renderAssetForm = () => (
    <>
      <label htmlFor="asset">
        Asset:
        <select
          id="asset"
          value={selectedAssetId}
          onChange={(e) => setSelectedAssetId(e.target.value)}
          className={css({
            display: "block",
            width: "full",
            p: 2,
            border: "1px solid",
            borderColor: "neutral.300",
            borderRadius: "md",
          })}
        >
          {filteredAssets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name} - {asset.unit}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="assetCount">
        Number of {selectedAsset?.name || "assets"}:
        <input
          type="text"
          id="assetCount"
          value={assetCountInput}
          onChange={handleAssetCountChange}
          onBlur={handleAssetCountBlur}
          inputMode="numeric"
          pattern="-?[0-9]*\.?[0-9]*"
          className={css({
            display: "block",
            width: "full",
            p: 2,
            border: "1px solid",
            borderColor: "neutral.300",
            borderRadius: "md",
          })}
        />
      </label>
      {assetCount > 0 && selectedAsset && (
        <div className={css({ fontSize: "sm", color: "gray.600" })}>
          Converted value: {convertedAssetValue.toFixed(2)} {assetLinkedFactor?.unit || ""}
          <br />
          Estimated emissions: {calculatedAssetEmission} Kg CO₂e
        </div>
      )}
    </>
  );

  // Check if there are any factors or assets to display
  const hasFactors = filteredFactors.length > 0;
  const hasAssets = filteredAssets.length > 0;

  // Handle case where no data is available
  if ((inputType === "factor" && !hasFactors) ||
    (inputType === "asset" && !hasAssets) ||
    (inputType === "both" && !hasFactors && !hasAssets)) {
    return (
      <div className={css({
        p: 4,
        border: "1px solid",
        borderColor: "neutral.400",
        bg: "white",
        borderRadius: "md",
      })}>
        No data available for the selected input type.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={css({
        p: 4,
        border: "1px solid",
        borderColor: "neutral.400",
        bg: "white",
        borderRadius: "md",
      })}
    >
      <div className={flex({ flexDirection: "column", gap: 4 })}>
        {/* Show input type selector if both modes are available */}
        {inputType === "both" && (
          <div className={flex({ gap: 4 })}>
            <button
              type="button"
              onClick={() => setMode("factor")}
              disabled={!hasFactors}
              className={css({
                p: 2,
                bg: mode === "factor" ? "blue.500" : "gray.200",
                color: mode === "factor" ? "white" : "gray.700",
                borderRadius: "md",
                flex: 1,
                opacity: !hasFactors ? 0.5 : 1,
                cursor: !hasFactors ? "not-allowed" : "pointer"
              })}
            >
              Factor Input
            </button>
            <button
              type="button"
              onClick={() => setMode("asset")}
              disabled={!hasAssets}
              className={css({
                p: 2,
                bg: mode === "asset" ? "blue.500" : "gray.200",
                color: mode === "asset" ? "white" : "gray.700",
                borderRadius: "md",
                flex: 1,
                opacity: !hasAssets ? 0.5 : 1,
                cursor: !hasAssets ? "not-allowed" : "pointer"
              })}
            >
              Asset Input
            </button>
          </div>
        )}

        {/* Factor input form */}
        {mode === "factor" && (inputType === "both" || inputType === "factor") && hasFactors && renderFactorForm()}

        {/* Asset input form */}
        {mode === "asset" && (inputType === "both" || inputType === "asset") && hasAssets && renderAssetForm()}

        <button
          type="submit"
          className={css({
            bg: "blue.500",
            color: "white",
            p: 2,
            borderRadius: "md",
            "&:hover": { bg: "blue.600" },
          })}
        >
          {editingData ? "Save Changes" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default DataInput;
