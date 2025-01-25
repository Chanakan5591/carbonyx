import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { chartData } from "~/utils/mock-data";
import { css } from "carbonyxation/css";
import { flex, vstack, hstack } from "carbonyxation/patterns";

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
      <div
        className={vstack({
          bg: "white",
          border: "1px solid",
          w: 36,
          h: 36,
          rounded: "2xl",
          p: 2,
          justifyContent: "center",
          alignItems: "left",
        })}
      >
        <span
          className={css({
            fontSize: 12,
            fontWeight: "thin",
          })}
        >
          Total Emissions
        </span>
        <span
          className={hstack({
            alignItems: "end",
          })}
        >
          <span
            className={css({
              fontWeight: "bold",
              fontSize: 60,
              lineHeight: 1,
            })}
          >
            {72}
          </span>

          <span
            className={css({
              fontSize: 12,
            })}
          >
            tCO₂e
          </span>
        </span>
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
