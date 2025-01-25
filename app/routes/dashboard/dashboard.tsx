import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import {
  chartData,
  latestGrossEmissionsTonnes,
  latestNetEmissionsTonnes,
  latestOffsetTonnes,
  previousGrossEmissionsTonnes,
  previousNetEmissionsTonnes,
  previousOffsetTonnes,
} from "~/utils/mock-data";
import { css } from "carbonyxation/css";
import { flex, vstack, hstack } from "carbonyxation/patterns";
import Indicator from "~/components/indicator";

export default function Historical() {
  const options = {
    plugins: {
      title: {
        display: true,
        text: "Monthly Statistics of Carbon Emissions & Offset",
      },
      tooltip: {
        // Tooltip configuration
        mode: "index", // Show tooltips for all datasets at the hovered x-value
        intersect: false, // Tooltips show even if the mouse is not directly over a data point
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label +=
                new Intl.NumberFormat("en-US", {
                  style: "decimal",
                  maximumFractionDigits: 0,
                }).format(context.parsed.y) + " kg CO₂e";
            }
            return label;
          },
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: "Month", // X-axis label
        },
      },
      "y-axis-1": {
        stacked: true,
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "Stacked Emissions (kg CO₂e)", // Y-axis-1 label
        },
      },
      "y-axis-2": {
        type: "linear",
        position: "right",
        stacked: false,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Gross/Net/Offset Emissions (kg CO₂e)", // Y-axis-2 label
        },
      },
    },
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
      <span
        className={css({
          fontSize: "xl",
          fontWeight: "bold",
        })}
      >
        Carbon Emission / Offset Dashboard
      </span>
      <div className={hstack()}>
        <Indicator
          label="Net Emissions"
          value={latestNetEmissionsTonnes}
          previous={previousNetEmissionsTonnes}
          unit="Kg CO₂e"
        />
        <Indicator
          label="Gross Emissions"
          value={latestGrossEmissionsTonnes}
          previous={previousGrossEmissionsTonnes}
          unit="Kg CO₂e"
        />
        <Indicator
          label="Total Offset"
          value={latestOffsetTonnes}
          previous={previousOffsetTonnes}
          unit="Kg CO₂e"
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
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
