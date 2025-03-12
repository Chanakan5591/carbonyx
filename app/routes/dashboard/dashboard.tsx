import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { css } from "carbonyxation/css";
import { flex, hstack } from "carbonyxation/patterns";
import Indicator from "~/components/indicator";
import type { Route } from "./+types/dashboard";
import { provideData } from "~/utils/emission-provider.server";
import { Suspense, useState, useEffect, useRef } from "react";
import { monthlyOptions, yearlyOptions } from "~/utils/chart-options";
import {
  formatMonthYear,
  getYearRange,
  getPreviousYearRange,
} from "~/utils/time-utils";
import { getAuth } from "@clerk/react-router/ssr.server";
import { Await } from "react-router";

export function loader(args: Route.LoaderArgs) {
  const auth = getAuth(args);
  const orgId = auth.then(auth => auth.orgId);

  // Not awaited - will be resolved later in the component
  const data = orgId.then(id => provideData(id ?? ""));

  return data;
}

export default function Dashboard({ loaderData: data }: Route.ComponentProps) {
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

  // --- Handle Date Range Selection ---
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
    if (
      !startDate ||
      isNaN(startDate.getTime()) ||
      (endDate && startDate > endDate)
    ) {
      setStartDate(validStartDateRef.current);
    }
  };

  const handleEndDateBlur = () => {
    if (
      !endDate ||
      isNaN(endDate.getTime()) ||
      (startDate && endDate < startDate)
    ) {
      setEndDate(validEndDateRef.current);
    }
  };

  const getFilteredData = (dashboardData, monthYearView) => {
    // Use valid dates from refs for filtering
    if (!validStartDateRef.current || !validEndDateRef.current) {
      return monthYearView === "month"
        ? dashboardData.monthly.allMonths
        : dashboardData.yearly.allYears;
    }
    const startTimestamp = validStartDateRef.current.getTime() / 1000;
    const endTimestamp = validEndDateRef.current.getTime() / 1000;
    if (monthYearView === "month") {
      const labels = dashboardData.monthly.allMonths.labels
        .filter((label) => {
          const date = new Date(label + "-01");
          const timestamp = date.getTime() / 1000;
          return timestamp >= startTimestamp && timestamp <= endTimestamp;
        })
        .map((label) =>
          formatMonthYear(new Date(label + "-01").getTime() / 1000),
        );
      const filteredMonths = dashboardData.monthly.allMonths.datasets.map((dataset) => ({
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
      const labels = dashboardData.yearly.allYears.labels.filter((label) => {
        const year = parseInt(label);
        const yearStart = new Date(year, 0, 1).getTime() / 1000;
        const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;
        return yearStart >= startTimestamp && yearEnd <= endTimestamp;
      });
      const filteredYears = dashboardData.yearly.allYears.datasets.map((dataset) => ({
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
            Toggle Monthly/Yearly
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

      {/* Use Suspense and Await for the data */}
      <Suspense fallback={<LoadingIndicators />}>
        <Await
          resolve={data}
          errorElement={<ErrorDisplay />}
        >
          {(resolvedData) => (
            <>
              <div className={hstack()}>
                <Indicator
                  label="Net Emissions"
                  value={
                    monthYear === "month"
                      ? resolvedData.monthly.latestNetEmissionsTonnes
                      : resolvedData.yearly.latestNetEmissionsTonnes
                  }
                  previous={
                    monthYear === "month"
                      ? resolvedData.monthly.previousNetEmissionsTonnes
                      : resolvedData.yearly.previousNetEmissionsTonnes
                  }
                  unit="tCO₂e"
                />
                <Indicator
                  label="Gross Emissions"
                  value={
                    monthYear === "month"
                      ? resolvedData.monthly.latestGrossEmissionsTonnes
                      : resolvedData.yearly.latestGrossEmissionsTonnes
                  }
                  previous={
                    monthYear === "month"
                      ? resolvedData.monthly.previousGrossEmissionsTonnes
                      : resolvedData.yearly.previousGrossEmissionsTonnes
                  }
                  unit="tCO₂e"
                />
                <Indicator
                  label="Total Offset"
                  value={resolvedData.yearly.latestOffsetTonnes}
                  previous={resolvedData.yearly.previousOffsetTonnes}
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
                {monthYear === "month" ? (
                  <Bar data={getFilteredData(resolvedData, monthYear)} options={monthlyOptions} />
                ) : (
                  <Bar data={getFilteredData(resolvedData, monthYear)} options={yearlyOptions} />
                )}
              </div>
            </>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

// Loading indicator component for the Suspense fallback
function LoadingIndicators() {
  return (
    <>
      <div className={hstack()}>
        <IndicatorSkeleton />
        <IndicatorSkeleton />
        <IndicatorSkeleton />
      </div>
      <div
        className={flex({
          bg: "white",
          w: "full",
          rounded: "2xl",
          h: "40rem",
          p: 4,
          border: "1px solid",
          justifyContent: "center",
          alignItems: "center",
        })}
      >
        <div>Loading chart data...</div>
      </div>
    </>
  );
}

// Error display component
function ErrorDisplay() {
  return (
    <div className={css({ p: 4, color: "red" })}>
      <h2>Error Loading Data</h2>
      <p>There was a problem loading the dashboard data. Please try again later.</p>
    </div>
  );
}

// Simple skeleton for indicators
function IndicatorSkeleton() {
  return (
    <div className={css({
      w: "full",
      p: 4,
      bg: "gray-100",
      rounded: "xl",
      m: 2,
      h: "6rem",
      animation: "pulse 1.5s infinite"
    })}>
      <div className={css({ w: "70%", h: "1rem", bg: "gray-200", mb: 2, rounded: "md" })}></div>
      <div className={css({ w: "40%", h: "2rem", bg: "gray-200", rounded: "md" })}></div>
    </div>
  );
}
