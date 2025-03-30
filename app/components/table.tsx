import { css } from "carbonyxation/css";
import { flex } from "carbonyxation/patterns";
import React, { useState, useEffect } from "react";

export interface Column {
  key: string;
  title: string;
  type: string;
  prefix?: string | ((row: RowData) => string);
  suffix?: string | ((row: RowData) => string);
}

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
        {/* Actions header */}
        <th
          className={css({
            py: 2,
            px: 4,
            textAlign: "center",
            color: "neutral.400",
            fontWeight: "medium",
          })}
        >
          Actions
        </th>
      </tr>
    </thead>
  );
};

interface RowProps {
  rowData: RowData;
  columns: Column[];
  onEditStart: (data: any) => void;
  onDelete: (id: string) => void;
}

const TableRow = ({ rowData, columns, onEditStart, onDelete }: RowProps) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleEditClick = () => {
    // Pass through the entire rowData object to let the parent component extract what it needs
    onEditStart(rowData);
  };

  const handleDeleteClick = () => {
    onDelete(rowData.id as string);
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
              verticalAlign: "middle",
            })}
          >
            {column.prefix && (
              <span>
                {typeof column.prefix === 'function'
                  ? column.prefix(rowData)
                  : column.prefix}
              </span>
            )}

            {column.type === "timestamp"
              ? formatDate(cellValue as number)
              : cellValue !== undefined && cellValue !== null
                ? cellValue.toString()
                : ""}

            {column.suffix && (
              <span className={css({ color: "neutral.500" })}>
                {" "}
                {typeof column.suffix === 'function'
                  ? column.suffix(rowData)
                  : column.suffix}
              </span>
            )}
          </td>
        );
      })}
      <td
        className={css({
          px: 4,
          py: 4,
          borderBottom: "1px solid",
          borderBottomColor: "neutral.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        })}
      >
        <button
          onClick={handleEditClick}
          className={css({
            bg: "yellow.400",
            color: "black",
            py: 2,
            px: 4,
            borderRadius: "md",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s ease-in-out",
            "&:hover": { bg: "yellow.500" },
          })}
        >
          Edit
        </button>
        <button
          onClick={handleDeleteClick}
          className={css({
            bg: "red.400",
            color: "white",
            py: 2,
            px: 4,
            borderRadius: "md",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s ease-in-out",
            "&:hover": { bg: "red.500" },
          })}
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

interface BodyProps {
  data: RowData[];
  columns: Column[];
  onEditStart: (data: any) => void;
  onDelete: (id: string) => void;
}

const TableBody = ({ data, columns, onEditStart, onDelete }: BodyProps) => {
  return (
    <tbody>
      {data.map((rowData, index) => (
        <TableRow
          key={index}
          rowData={rowData}
          columns={columns}
          onEditStart={onEditStart}
          onDelete={onDelete}
        />
      ))}
    </tbody>
  );
};

interface TableProps {
  columns: Column[];
  data: RowData[];
  onEditStart: (data: any) => void;
  onDelete: (id: string) => void;
}

const Table = ({ columns, data, onEditStart, onDelete }: TableProps) => {
  // Local state for sorting and displaying the table data
  const [tableData, setTableData] = useState(data);

  // Synchronize local state with new prop values when data changes
  useEffect(() => {
    setTableData(data);
  }, [data]);

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

      switch (columnType) {
        case "timestamp":
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
        <TableBody
          data={tableData}
          columns={columns}
          onEditStart={onEditStart}
          onDelete={onDelete}
        />
      </table>
    </div>
  );
};

export default Table;
