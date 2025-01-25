import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { chartData } from "~/utils/mock-data";
import { css } from "carbonyxation/css";
import { flex, vstack, hstack } from "carbonyxation/patterns";
import Indicator from "~/components/indicator";

export default function Historical() {
  const options = {
    plugins: {
      title: {
        display: true,
        text: "Historical Statistics of Emissions (Kg CO₂e)",
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        ticks: {
          // Optional: Add a callback to format y-axis labels
          callback: function (value) {
            return value < 0
              ? "(" + Math.abs(value).toLocaleString() + ")"
              : value.toLocaleString();
          },
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
          label="Total Emissions"
          value={624}
          previous={527}
          unit="tCO₂e"
        />
        <Indicator
          label="Total Offset"
          value={41}
          previous={34}
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
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
