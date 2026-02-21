"use client";

// REACT
import { useState, useMemo, useCallback } from "react";

// STORE
import { useDatabaseStore } from "@/stores/database";

// CLSX
import clsx from "clsx";

// LUCIDE
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

// TYPES
import { DatabaseCell, DatabaseProperty, DatabaseRow } from "@/types";

const CalendarView = () => {
  // Stores
  const { properties, getFilteredSortedRows, cells, addRow, updateCellValue } =
    useDatabaseStore();

  // States
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Filtered Sorted Rows
  const rows = getFilteredSortedRows();

  // Find - Date Property
  const dateProp = properties.find((p: DatabaseProperty) => p.type === "date");
  const titleProp = properties.find((p: DatabaseProperty) => p.type === "text");

  // Computed - Calendar Days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Computed - Days in Month, First Day of Week
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Memo - Calendar Grid Days
  const calendarDays = useMemo(() => {
    const days: Array<{ day: number; isCurrentMonth: boolean }> = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, isCurrentMonth: false });
    }

    return days;
  }, [year, month, daysInMonth, firstDayOfWeek]);

  // Callback - Get Rows for a Day
  const getRowsForDay = useCallback(
    (day: number) => {
      if (!dateProp) return [];
      const dayStart = new Date(year, month, day).getTime();
      const dayEnd = new Date(year, month, day + 1).getTime();

      return rows.filter((row) => {
        const rowCells = cells[row.id] ?? [];
        const dateCell = rowCells.find((c) => c.propertyId === dateProp.id);
        if (!dateCell?.value) return false;
        const ts = parseInt(dateCell.value);
        return ts >= dayStart && ts < dayEnd;
      });
    },
    [dateProp, rows, cells, year, month],
  );

  // Callback - Handle Add to Day
  const handleAddToDay = useCallback(
    async (day: number) => {
      const row: DatabaseRow = await addRow();
      if (dateProp) {
        const ts = new Date(year, month, day, 12).getTime();
        await updateCellValue(row.id, dateProp.id, ts.toString());
      }
    },
    [addRow, dateProp, year, month, updateCellValue],
  );

  // Case - No Date Property
  if (!dateProp) {
    return (
      <div className="p-8 text-center text-sm text-text-muted">
        Add a <span className="font-medium text-text">Date</span> property to
        use Calendar view.
      </div>
    );
  }

  // Month Name
  const monthName = new Date(year, month).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-4">
      {/* MONTH NAVIGATIOn */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text">{monthName}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1))}
            className="rounded-md p-1.5 text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-md px-2 py-1 text-xs text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1))}
            className="rounded-md p-1.5 text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* DAY HEADERS */}
      <div className="grid grid-cols-7 gap-px">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d: string) => (
          <div
            key={d}
            className="px-2 py-1 text-center text-xs font-medium text-text-faint"
          >
            {d}
          </div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 gap-px rounded-lg border border-border">
        {calendarDays.map(({ day, isCurrentMonth }, i) => {
          const dayRows = isCurrentMonth ? getRowsForDay(day) : [];
          const isToday =
            isCurrentMonth &&
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <div
              key={i}
              className={clsx(
                "group min-h-[80px] border-b border-r border-border p-1",
                isCurrentMonth ? "bg-bg" : "bg-surface/50",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={clsx(
                    "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                    isToday
                      ? "bg-accent text-white"
                      : isCurrentMonth
                        ? "text-text-muted"
                        : "text-text-faint",
                  )}
                >
                  {day}
                </span>
                {isCurrentMonth && (
                  <button
                    onClick={() => handleAddToDay(day)}
                    className="hidden h-4 w-4 items-center justify-center rounded text-text-faint hover:text-text-muted group-hover:flex"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>

              {/* DAY ITEMS */}
              <div className="mt-0.5 space-y-0.5">
                {dayRows.slice(0, 3).map((row: DatabaseRow, index: number) => {
                  const rowCells: DatabaseCell[] = cells[row.id] ?? [];
                  const titleCell = titleProp
                    ? rowCells.find(
                        (c: DatabaseCell) => c.propertyId === titleProp.id,
                      )
                    : undefined;
                  return (
                    <div
                      key={index}
                      className="truncate rounded bg-accent/10 px-1 py-0.5 text-[10px] text-accent-light cursor-pointer hover:bg-accent/20"
                    >
                      {titleCell?.value || "Untitled"}
                    </div>
                  );
                })}
                {dayRows.length > 3 && (
                  <div className="px-1 text-[10px] text-text-faint">
                    +{dayRows.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
