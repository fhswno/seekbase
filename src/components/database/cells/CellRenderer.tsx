"use client";

// REACT
import { useCallback } from "react";

// STORE
import { useDatabaseStore } from "@/stores/database";

// COMPONENTS
import TextCell from "./TextCell";
import NumberCell from "./NumberCell";
import SelectCell from "./SelectCell";
import MultiSelectCell from "./MultiSelectCell";
import DateCell from "./DateCell";
import CheckboxCell from "./CheckboxCell";
import URLCell from "./URLCell";
import TimestampCell from "./TimestampCell";

// TYPES
import type { PropertyType } from "@/types";

// TYPESCRIPT
type Props = {
  rowId: string;
  propertyId: string;
  propertyType: PropertyType;
  propertyOptions: string;
  editable?: boolean;
};

const CellRenderer = ({
  rowId,
  propertyId,
  propertyType,
  propertyOptions,
  editable = true,
}: Props) => {
  // Stores
  const value = useDatabaseStore((s) => s.getCellValue(rowId, propertyId));
  const updateCellValue = useDatabaseStore((s) => s.updateCellValue);

  // Callback - Change
  const handleChange = useCallback(
    async (newValue: string) => {
      await updateCellValue(rowId, propertyId, newValue);
    },
    [rowId, propertyId, updateCellValue],
  );

  // Switch - Property Type
  switch (propertyType) {
    case "text":
    case "email":
      return (
        <TextCell value={value} onChange={handleChange} editable={editable} />
      );
    case "number":
      return (
        <NumberCell value={value} onChange={handleChange} editable={editable} />
      );
    case "select":
      return (
        <SelectCell
          value={value}
          options={propertyOptions}
          onChange={handleChange}
          editable={editable}
        />
      );
    case "multi_select":
      return (
        <MultiSelectCell
          value={value}
          options={propertyOptions}
          onChange={handleChange}
          editable={editable}
        />
      );
    case "date":
      return (
        <DateCell value={value} onChange={handleChange} editable={editable} />
      );
    case "checkbox":
      return (
        <CheckboxCell
          value={value}
          onChange={handleChange}
          editable={editable}
        />
      );
    case "url":
      return (
        <URLCell value={value} onChange={handleChange} editable={editable} />
      );
    case "created_at":
    case "updated_at":
      return <TimestampCell value={value} />;
    default:
      return (
        <TextCell value={value} onChange={handleChange} editable={editable} />
      );
  }
};

export default CellRenderer;
