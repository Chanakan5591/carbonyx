import { useAuth } from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { css } from "carbonyxation/css";
import { flex } from "carbonyxation/patterns";
import React, { useState, useEffect, useRef } from "react";

export interface DataInputProps {
  availableFactors: {
    id: number;
    name: string;
    unit: string;
    type: string;
    subType: string;
    factor: number;
  }[];
  onSubmit: (data: {
    factorId: number;
    value: number;
    orgId: string;
    factorValue: number;
  }) => Promise<void>;
  onEdit: (
    id: string,
    data: { factorId: number; value: number },
  ) => Promise<void>;
  editingData?: { id: string; factorId: number; value: number } | null;
  factorType: string;
}

const DataInput = ({
  availableFactors,
  onSubmit,
  onEdit,
  editingData = null,
  factorType,
}: DataInputProps) => {
  const [factorId, setFactorId] = useState<number>(
    editingData?.factorId || availableFactors[0]?.id || 0,
  );
  const [value, setValue] = useState<number>(editingData?.value || 0);

  const hasEditingDataChanged = useRef(false);

  // Filter factors by type
  const filteredFactors = availableFactors.filter(
    (factor) => factor.type === factorType,
  );

  useEffect(() => {
    // Only update the states if editingData changes for the first time
    if (editingData && !hasEditingDataChanged.current) {
      setFactorId(editingData.factorId);
      setValue(editingData.value);
      hasEditingDataChanged.current = true; // Prevent further resetting
    }
  }, [editingData]);

  useEffect(() => {
    // Update factorId if the current factorId is not in the filteredFactors
    if (
      !filteredFactors.some((factor) => factor.id === factorId) &&
      filteredFactors.length > 0
    ) {
      setFactorId(filteredFactors[0].id);
    }
  }, [filteredFactors]);

  const auth = useAuth();
  const orgId = auth.orgId!;

  const factorValue =
    filteredFactors.find((factor) => factor.id === factorId)?.factor || 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (editingData) {
      await onEdit(editingData.id, { factorId, value });
    } else {
      await onSubmit({ factorId, value, orgId, factorValue });
    }

    // Reset form after submission
    setFactorId(filteredFactors[0]?.id || 0);
    setValue(0);
    hasEditingDataChanged.current = false; // Reset editing tracking
  };

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
          Value:
          <input
            type="number"
            id="value"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
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
