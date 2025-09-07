import React from "react";

interface MergedCell {
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
}

type Align = "left" | "center" | "right";
type VAlign = "top" | "middle" | "bottom";

interface MergeCustomGridProps {
  rows: number;
  cols: number;
  cellContent: (row: number, col: number) => React.ReactNode | null;
  colSizes?: Record<number, string>;
  rowSizes?: Record<number, string>;
  defaultRowSize?: string;
  defaultColSize?: string;
  cellStyle?: (row: number, col: number) => React.CSSProperties;
  mergedCells?: MergedCell[];
  horizontalAlign?: Align;
  verticalAlign?: VAlign;
  onCellClick?: (row: number, col: number) => void;
}

const MergeCustomGrid: React.FC<MergeCustomGridProps> = ({
  rows,
  cols,
  cellContent,
  colSizes = {},
  rowSizes = {},
  defaultRowSize = "auto",
  defaultColSize = "auto",
  cellStyle = () => ({}),
  mergedCells = [],
  horizontalAlign = "center",
  verticalAlign = "middle",
  onCellClick,
}) => {
  const mergedCellsMap = new Map<string, { rowSpan: number; colSpan: number }>();
  const coveredCells = new Set<string>();

  mergedCells.forEach(({ row, col, rowSpan = 1, colSpan = 1 }) => {
    mergedCellsMap.set(`${row}-${col}`, { rowSpan, colSpan });
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + colSpan; c++) {
        if (r === row && c === col) continue;
        coveredCells.add(`${r}-${c}`);
      }
    }
  });

  const colWidths = Array.from({ length: cols }).map(
    (_, i) => colSizes[i] || defaultColSize
  );
  const rowHeights = Array.from({ length: rows }).map(
    (_, i) => rowSizes[i] || defaultRowSize
  );

  const justifyContentMap: Record<Align, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };
  const alignItemsMap: Record<VAlign, string> = {
    top: "flex-start",
    middle: "center",
    bottom: "flex-end",
  };

  const getMergedContent = (
    startRow: number,
    startCol: number,
    rowSpan: number,
    colSpan: number
  ): React.ReactNode | null => {
    for (let r = startRow; r < startRow + rowSpan; r++) {
      for (let c = startCol; c < startCol + colSpan; c++) {
        const value = cellContent(r, c);
        if (value != null) return value;
      }
    }
    return null;
  };

  return (
    <div className="flex">
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: colWidths.join(" "),
          gridTemplateRows: rowHeights.join(" "),
        }}
      >
        {Array.from({ length: rows }).map((_, rowIndex) =>
          Array.from({ length: cols }).map((_, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            if (coveredCells.has(key)) return null;

            const mergeInfo = mergedCellsMap.get(key);
            const customStyle = cellStyle(rowIndex, colIndex) || {};

            const alignmentStyle: React.CSSProperties = {
              justifyContent: justifyContentMap[horizontalAlign],
              alignItems: alignItemsMap[verticalAlign],
            };

            if (mergeInfo) {
              alignmentStyle.gridColumn = `span ${mergeInfo.colSpan}`;
              alignmentStyle.gridRow = `span ${mergeInfo.rowSpan}`;
            }

            const baseBorder = "1px solid #ccc";
            const cellBorders: React.CSSProperties = {
              borderTop: rowIndex === 0 ? baseBorder : "none",
              borderLeft: colIndex === 0 ? baseBorder : "none",
              borderRight: baseBorder,
              borderBottom: baseBorder,
            };

            const handleClick = () => {
              onCellClick?.(rowIndex, colIndex);
            };

            const content = mergeInfo
              ? getMergedContent(rowIndex, colIndex, mergeInfo.rowSpan, mergeInfo.colSpan)
              : cellContent(rowIndex, colIndex);

            return (
              <div
                key={key}
                className="bg-gray-200 p-1 text-center flex"
                style={{
                  ...alignmentStyle,
                  ...customStyle,
                  ...cellBorders,
                }}
                onClick={handleClick}
              >
                {content}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MergeCustomGrid;
