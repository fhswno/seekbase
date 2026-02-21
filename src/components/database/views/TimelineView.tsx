"use client";

// REACT
import { useState, useMemo, useCallback } from "react";

// STORE
import { useDatabaseStore } from "@/stores/database";

// CLSX
import clsx from "clsx";

// LUCIDE
import { ChevronLeft, ChevronRight } from "lucide-react";

// TYPES
import { DatabaseCell, DatabaseProperty, DatabaseRow } from "@/types";

// CONSTANTS
const DAY_WIDTH = 40;
const ROW_HEIGHT = 36;

const TimelineView = () => {
  // Stores
  const { properties, getFilteredSortedRows, cells } = useDatabaseStore();

  // States
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  // Filtered Sorted Rows
  const rows = getFilteredSortedRows();

  // Filter & Find - Date Properties for Timeline
  const dateProps = properties.filter(
    (p: DatabaseProperty) => p.type === "date",
  );
  const titleProp = properties.find((p: DatabaseProperty) => p.type === "text");

  // Computed - Start and End Date Properties
  const startDateProp: DatabaseProperty = dateProps[0];
  const endDateProp: DatabaseProperty =
    dateProps.length > 1 ? dateProps[1] : dateProps[0];

  // Constants - Number of Days to Show in Timeline (5 weeks)
  const daysInView = 35;

  // Memo - Generate Array of Dates for Timeline Header
  const days = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < daysInView; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      result.push(d);
    }
    return result;
  }, [startDate, daysInView]);

  // Callback - Navigate Timeline by Week
  const navigateWeek = useCallback(
    (direction: number) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + direction * 7);
      setStartDate(d);
    },
    [startDate],
  );

  // Case - No Date Property
  if (!startDateProp) {
    return (
      <div className="p-8 text-center text-sm text-text-muted">
        Add a <span className="font-medium text-text">Date</span> property to
        use Timeline view.
        {dateProps.length === 1 && (
          <span className="block mt-1 text-xs text-text-faint">
            Add a second Date property for start/end range support.
          </span>
        )}
      </div>
    );
  }

  // Label - Current Month and Year
  const monthLabel = startDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="overflow-x-auto">
      {/* HEADER WITH NAVIGATION */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <h3 className="text-sm font-semibold text-text">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateWeek(-1)}
            className="rounded-md p-1 text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => {
              const d: Date = new Date();
              d.setDate(1);
              setStartDate(d);
            }}
            className="rounded-md px-2 py-0.5 text-xs text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
          >
            Today
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="rounded-md p-1 text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* ROW LABELS */}
        <div className="w-48 flex-shrink-0 border-r border-border">
          {/* DAY HEADER SPACER */}
          <div className="h-8 border-b border-border" />

          {rows.map((row: DatabaseRow, index: number) => {
            const rowCells: DatabaseCell[] = cells[row.id] ?? [];
            const titleCell = titleProp
              ? rowCells.find((c) => c.propertyId === titleProp.id)
              : undefined;
            return (
              <div
                key={index}
                className="flex items-center border-b border-border px-3 text-sm text-text"
                style={{ height: ROW_HEIGHT }}
              >
                <span className="truncate">
                  {titleCell?.value || "Untitled"}
                </span>
              </div>
            );
          })}
        </div>

        {/* TIMELINE GRID */}
        <div className="flex-1 overflow-x-auto">
          {/* DAY HEADERS */}
          <div className="flex border-b border-border">
            {days.map((day: Date, i: number) => {
              const isWeekend: boolean =
                day.getDay() === 0 || day.getDay() === 6;
              const isToday: boolean =
                day.toDateString() === new Date().toDateString();
              return (
                <div
                  key={i}
                  className={clsx(
                    "flex-shrink-0 border-r border-border px-0.5 py-1 text-center",
                    isWeekend && "bg-surface/50",
                  )}
                  style={{ width: DAY_WIDTH }}
                >
                  <div className="text-[9px] text-text-faint">
                    {day.toLocaleString("en-US", { weekday: "narrow" })}
                  </div>
                  <div
                    className={clsx(
                      "text-[10px]",
                      isToday ? "font-bold text-accent" : "text-text-muted",
                    )}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ROW BARS */}
          {rows.map((row: DatabaseRow, index: number) => {
            const rowCells: DatabaseCell[] = cells[row.id] ?? [];
            const startCell = rowCells.find(
              (c: DatabaseCell) => c.propertyId === startDateProp.id,
            );
            const endCell = endDateProp
              ? rowCells.find(
                  (c: DatabaseCell) => c.propertyId === endDateProp.id,
                )
              : startCell;

            const startTs: number = startCell?.value
              ? parseInt(startCell.value)
              : 0;
            const endTs: number = endCell?.value
              ? parseInt(endCell.value)
              : startTs;

            // Computed - Bar Position
            const viewStart: number = days[0].getTime();
            const viewEnd: number = days[days.length - 1].getTime() + 86400000;

            // Constants
            let barLeft = 0;
            let barWidth = 0;

            // Case - Bar Within View Range
            if (
              startTs &&
              startTs < viewEnd &&
              (endTs || startTs) >= viewStart
            ) {
              const effectiveStart = Math.max(startTs, viewStart);
              const effectiveEnd = Math.min(
                endTs || startTs + 86400000,
                viewEnd,
              );
              barLeft =
                ((effectiveStart - viewStart) / (viewEnd - viewStart)) *
                (daysInView * DAY_WIDTH);
              barWidth =
                ((effectiveEnd - effectiveStart) / (viewEnd - viewStart)) *
                (daysInView * DAY_WIDTH);
              barWidth = Math.max(barWidth, DAY_WIDTH / 2);
            }

            return (
              <div
                key={index}
                className="relative border-b border-border"
                style={{
                  height: ROW_HEIGHT,
                  width: daysInView * DAY_WIDTH,
                }}
              >
                {/* GRID LINES */}
                <div className="absolute inset-0 flex">
                  {days.map((day: Date, i: number) => (
                    <div
                      key={i}
                      className={clsx(
                        "flex-shrink-0 border-r border-border",
                        day.getDay() === 0 || day.getDay() === 6
                          ? "bg-surface/30"
                          : "",
                      )}
                      style={{ width: DAY_WIDTH }}
                    />
                  ))}
                </div>

                {/* BAR */}
                {startTs > 0 && barWidth > 0 && (
                  <div
                    className="absolute top-1.5 rounded bg-accent/70 cursor-pointer hover:bg-accent transition-colors duration-[80ms]"
                    style={{
                      left: barLeft,
                      width: barWidth,
                      height: ROW_HEIGHT - 12,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
