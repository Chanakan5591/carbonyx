import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { css } from "carbonyxation/css";
import { flex, vstack, hstack } from "carbonyxation/patterns";
import Indicator from "~/components/indicator";
import type { Route } from "./+types/dashboard";
import { provideData } from "~/utils/emission-provider.server";
import { useState, useEffect, useMemo, useRef } from "react";
import { monthlyOptions, yearlyOptions } from "~/utils/chart-options";
import {
  formatMonthYear,
  getMonthRange,
  getYearRange,
  getPreviousYearRange,
} from "~/utils/time-utils";

export async function loader({ params }: Route.LoaderArgs) {
  const mockOrgId = "1";
  const data = await provideData(mockOrgId);

  return data;
}

export default function Historical({ loaderData }: Route.ComponentProps) {
  const data = loaderData;
  const [monthYear, setMonthYear] = useState<"month" | "year">("month");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Use refs to track valid start and end dates
  const validStartDateRef = useRef<Date | null>(null);
  const validEndDateRef = useRef<Date | null>(null);

  // Set default start and end dates to the current year
  useEffect(() => {
    const now = new Date();
    const yearRange = getYearRange(now);
    const initialStartDate = new Date(yearRange.start);
    const initialEndDate = new Date(yearRange.end);
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    validStartDateRef.current = initialStartDate;
    validEndDateRef.current = initialEndDate;
  }, []);

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    // Use valid dates from refs for filtering
    if (!validStartDateRef.current || !validEndDateRef.current) {
      return monthYear === "month"
        ? data.monthly.allMonths
        : data.yearly.allYears;
    }

    const startTimestamp = validStartDateRef.current.getTime() / 1000;
    const endTimestamp = validEndDateRef.current.getTime() / 1000;

    if (monthYear === "month") {
      const labels = data.monthly.allMonths.labels
        .filter((label) => {
          const date = new Date(label + "-01");
          const timestamp = date.getTime() / 1000;
          return timestamp >= startTimestamp && timestamp <= endTimestamp;
        })
        .map((label) =>
          formatMonthYear(new Date(label + "-01").getTime() / 1000),
        );

      const filteredMonths = data.monthly.allMonths.datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data
          .filter((d) => {
            const date = new Date(d.month + "-01");
            const timestamp = date.getTime() / 1000;
            return timestamp >= startTimestamp && timestamp <= endTimestamp;
          })
          .map((d) => ({
            x: formatMonthYear(new Date(d.month + "-01").getTime() / 1000),
            y: d.emissions,
          })),
      }));

      return {
        labels,
        datasets: filteredMonths,
      };
    } else {
      const labels = data.yearly.allYears.labels.filter((label) => {
        const year = parseInt(label);
        const yearStart = new Date(year, 0, 1).getTime() / 1000;
        const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;
        return yearStart >= startTimestamp && yearEnd <= endTimestamp;
      });

      const filteredYears = data.yearly.allYears.datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data
          .filter((d) => {
            const year = parseInt(d.month);
            const yearStart = new Date(year, 0, 1).getTime() / 1000;
            const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;
            return yearStart >= startTimestamp && yearEnd <= endTimestamp;
          })
          .map((d) => ({
            x: d.month,
            y: d.emissions,
          })),
      }));

      return {
        labels,
        datasets: filteredYears,
      };
    }
  }, [data, monthYear, validStartDateRef.current, validEndDateRef.current]); // Depend on ref values

  // --- Quick Date Range Selection ---
  const handleDateRangeSelect = (range: string) => {
    const now = new Date();
    let newStartDate: Date, newEndDate: Date;

    switch (range) {
      case "thisYear":
        const thisYearRange = getYearRange(now);
        newStartDate = new Date(thisYearRange.start);
        newEndDate = new Date(thisYearRange.end);
        break;
      case "lastYear":
        const lastYearRange = getPreviousYearRange(now);
        newStartDate = new Date(lastYearRange.start);
        newEndDate = new Date(lastYearRange.end);
        break;
      case "last3Months":
        newEndDate = now;
        newStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      case "last6Months":
        newEndDate = now;
        newStartDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      default:
        return;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    validStartDateRef.current = newStartDate;
    validEndDateRef.current = newEndDate;
  };

  // --- Handle Date Input Changes ---
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setStartDate(newDate);
      if (!endDate || newDate <= endDate) {
        validStartDateRef.current = newDate;
      }
    } else {
      setStartDate(e.target.value as unknown as Date); // Allow invalid input temporarily
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setEndDate(newDate);
      if (!startDate || newDate >= startDate) {
        validEndDateRef.current = newDate;
      }
    } else {
      setEndDate(e.target.value as unknown as Date); // Allow invalid input temporarily
    }
  };

  // --- Handle Blur (Focus Loss) ---
  const handleStartDateBlur = () => {
    // If start date is invalid or after end date, revert to the last valid start date
    if (
      !startDate ||
      isNaN(startDate.getTime()) ||
      (endDate && startDate > endDate)
    ) {
      setStartDate(validStartDateRef.current);
    }
  };

  const handleEndDateBlur = () => {
    // If end date is invalid or before start date, revert to the last valid end date
    if (
      !endDate ||
      isNaN(endDate.getTime()) ||
      (startDate && endDate < startDate)
    ) {
      setEndDate(validEndDateRef.current);
    }
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
      <div className={hstack({})}>
        <span
          className={css({
            fontSize: "xl",
            fontWeight: "bold",
          })}
        >
          Welcome to Acme, Inc.
        </span>
        <div>
          {/* A switch to set monthly or yearly */}
          <button
            onClick={() =>
              setMonthYear((prev) => (prev === "month" ? "year" : "month"))
            }
            className={css({
              bg: monthYear === "month" ? "blue" : "gray",
              color: "white",
              p: 2,
              rounded: "md",
              m: 2,
            })}
          >
            Toggle
          </button>
        </div>
      </div>
      {/* Date Range Selection */}
      <div className={hstack({ gap: 2, alignItems: "center" })}>
        <div>
          <label htmlFor="start-date">Start Date:</label>
          <input
            type="date"
            id="start-date"
            value={
              startDate && !isNaN(startDate.getTime())
                ? startDate.toISOString().slice(0, 10)
                : ""
            }
            onChange={handleStartDateChange}
            onBlur={handleStartDateBlur}
            className={css({ p: 1, rounded: "md", border: "1px solid gray" })}
          />
        </div>
        <div>
          <label htmlFor="end-date">End Date:</label>
          <input
            type="date"
            id="end-date"
            value={
              endDate && !isNaN(endDate.getTime())
                ? endDate.toISOString().slice(0, 10)
                : ""
            }
            onChange={handleEndDateChange}
            onBlur={handleEndDateBlur}
            className={css({ p: 1, rounded: "md", border: "1px solid gray" })}
          />
        </div>
        {/* Quick Select Buttons */}
        <button
          onClick={() => handleDateRangeSelect("thisYear")}
          className={css({
            bg: "gray-200",
            p: 1,
            rounded: "md",
            border: "1px solid gray",
          })}
        >
          This Year
        </button>
        <button
          onClick={() => handleDateRangeSelect("lastYear")}
          className={css({
            bg: "gray-200",
            p: 1,
            rounded: "md",
            border: "1px solid gray",
          })}
        >
          Last Year
        </button>
        <button
          onClick={() => handleDateRangeSelect("last3Months")}
          className={css({
            bg: "gray-200",
            p: 1,
            rounded: "md",
            border: "1px solid gray",
          })}
        >
          Last 3 Months
        </button>
        <button
          onClick={() => handleDateRangeSelect("last6Months")}
          className={css({
            bg: "gray-200",
            p: 1,
            rounded: "md",
            border: "1px solid gray",
          })}
        >
          Last 6 Months
        </button>
      </div>

      <div className={hstack()}>
        <Indicator
          label="Net Emissions"
          value={
            monthYear === "month"
              ? data.monthly.latestNetEmissionsTonnes
              : data.yearly.latestNetEmissionsTonnes
          }
          previous={
            monthYear === "month"
              ? data.monthly.previousNetEmissionsTonnes
              : data.yearly.previousNetEmissionsTonnes
          }
          unit="tCO₂e"
        />
        <Indicator
          label="Gross Emissions"
          value={
            monthYear === "month"
              ? data.monthly.latestGrossEmissionsTonnes
              : data.yearly.latestGrossEmissionsTonnes
          }
          previous={
            monthYear === "month"
              ? data.monthly.previousGrossEmissionsTonnes
              : data.yearly.previousGrossEmissionsTonnes
          }
          unit="tCO₂e"
        />
        <Indicator
          label="Total Offset"
          value={data.yearly.latestOffsetTonnes}
          previous={data.yearly.previousOffsetTonnes}
          unit="tCO₂e"
          valueTrend="positive"
        />
      </div>
      <div
        className={flex({
          bg: "white",
          w: "full",
          rounded: "2xl",
          h: "40rem",
          p: 4,
          border: "1px solid",
        })}
      >
        {/* Use filteredData here */}
        {monthYear === "month" ? (
          <Bar data={filteredData} options={monthlyOptions} />
        ) : (
          <Bar data={filteredData} options={yearlyOptions} />
        )}
      </div>
    </div>
  );
}
