import { css } from "carbonyxation/css";
import { flex } from "carbonyxation/patterns";
import React, { useState, useEffect } from "react";

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
    value: number | null; // Allow null for empty input
    orgId: string;
  }) => Promise<void>;
  onEdit: (
    id: string,
    data: {
      factorId: number;
      value: number | null; // Allow null for empty input
    },
  ) => Promise<void>;
  editingData?: {
    id: string;
    factorId: number;
    value: number;
  } | null;
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
  const [inputValue, setInputValue] = useState<string>(
    editingData ? editingData.value.toString() : "",
  ); // Use string for input value

  const [isFocused, setIsFocused] = useState(false);

  // Filter factors
  const filteredFactors = availableFactors.filter(
    (factor) => factor.type === factorType,
  );

  useEffect(() => {
    if (editingData) {
      setFactorId(editingData.factorId);
      setInputValue(editingData.value.toString());
    } else {
      setInputValue(""); // Reset to empty when not editing
    }

    // Update factorId if not in filteredFactors
    if (
      !filteredFactors.some((factor) => factor.id === factorId) &&
      filteredFactors.length > 0
    ) {
      setFactorId(filteredFactors[0].id);
    }
  }, [editingData, filteredFactors, factorId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const orgId = "1";

    // Parse input value to number or null
    const value = inputValue === "" ? null : parseFloat(inputValue);

    if (editingData) {
      await onEdit(editingData.id, { factorId, value });
    } else {
      await onSubmit({ factorId, value, orgId });
    }

    // Clear the form
    setFactorId(filteredFactors[0]?.id || 0);
    setInputValue("");
    setIsFocused(false); // Reset focus state
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
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
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
          disabled={!isFocused && inputValue === ""} // Disable submit if empty and not focused
        >
          {editingData ? "Save Changes" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default DataInput;
