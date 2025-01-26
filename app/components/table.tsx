import { css } from "carbonyxation/css";
import { flex } from "carbonyxation/patterns";
import React, { useState } from "react";

interface Column {
  key: string;
  title: string;
  type: string;
  prefix?: string; // Optional prefix
  suffix?: string; // Optional suffix
}

// Type definition for a row of data
interface RowData {
  [key: string]: string | number | boolean | undefined | null;
}

interface HeaderProps {
  columns: Column[];
  onSort: (columnKey: string, sortDirection: SortDirection) => void;
}

type SortDirection = "asc" | "desc" | null;

const TableHeader = ({ columns, onSort }: HeaderProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: SortDirection;
  }>({ key: null, direction: null });

  const requestSort = (key: string) => {
    let direction: SortDirection = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
    }

    setSortConfig({ key, direction });
    onSort(key, direction);
  };

  return (
    <thead className={css({ overflow: "hidden" })}>
      <tr
        className={css({
          "&:first-of-type th:first-child": {
            borderLeftRadius: "full",
          },
          "&:first-of-type th:last-child": {
            borderRightRadius: "full",
          },
          bg: "neutral.100",
        })}
      >
        {columns.map((column) => (
          <th
            key={column.key}
            onClick={() => requestSort(column.key)}
            className={css({
              py: 2,
              px: 4,
              textAlign: "left",
              color: "neutral.400",
              fontWeight: "medium",
              cursor: "pointer",
              userSelect: "none",
              "&:hover": {
                bg: "neutral.200",
              },
            })}
          >
            <div className={flex({ alignItems: "center", gap: 2 })}>
              <span>{column.title}</span>
              {sortConfig.key === column.key &&
                (sortConfig.direction === "asc" ? (
                  <span>▲</span>
                ) : sortConfig.direction === "desc" ? (
                  <span>▼</span>
                ) : null)}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

interface RowProps {
  rowData: RowData;
  columns: Column[];
}

const TableRow = ({ rowData, columns }: RowProps) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <tr>
      {columns.map((column) => {
        const cellValue = rowData[column.key];

        return (
          <td
            key={`${cellValue}-${column.key}`}
            className={css({
              px: 4,
              py: 4,
              borderBottom: "1px solid",
              borderBottomColor: "neutral.100",
            })}
          >
            {/* Add prefix and suffix if available */}
            {column.prefix && <span>{column.prefix}</span>}
            {column.type === "timestamp"
              ? formatDate(cellValue as number)
              : cellValue !== undefined && cellValue !== null
                ? cellValue.toString()
                : ""}
            {column.suffix && (
              <span className={css({ color: "neutral.500" })}>
                {" "}
                {column.suffix}
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
};

interface BodyProps {
  data: RowData[];
  columns: Column[];
}

const TableBody = ({ data, columns }: BodyProps) => {
  return (
    <tbody>
      {data.map((rowData, index) => (
        <TableRow key={index} rowData={rowData} columns={columns} />
      ))}
    </tbody>
  );
};

interface TableProps {
  columns: Column[];
  data: RowData[];
}

const Table = ({ columns, data }: TableProps) => {
  const [tableData, setTableData] = useState(data);

  const handleSort = (columnKey: string, sortDirection: SortDirection) => {
    if (!columnKey || !sortDirection) {
      setTableData(data);
      return;
    }

    const columnType = columns.find((c) => c.key === columnKey)?.type;

    const sortedData = [...tableData].sort((a, b) => {
      const aValue = a[columnKey];
      const bValue = b[columnKey];

      // Handle null and undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Sort based on column type
      switch (columnType) {
        case "timestamp":
          // Now comparing numbers (Unix timestamps) directly
          return sortDirection === "asc"
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        case "number":
          return sortDirection === "asc"
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        case "text":
        case "boolean":
        default:
          return sortDirection === "asc"
            ? aValue.toString().localeCompare(bValue.toString())
            : bValue.toString().localeCompare(aValue.toString());
      }
    });

    setTableData(sortedData);
  };

  return (
    <div
      className={css({
        border: "1px solid",
        borderColor: "neutral.400",
        borderRadius: "lg",
        p: 8,
        bg: "white",
      })}
    >
      <table
        className={css({
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
        })}
      >
        <TableHeader columns={columns} onSort={handleSort} />
        <TableBody data={tableData} columns={columns} />
      </table>
    </div>
  );
};

export default Table;
