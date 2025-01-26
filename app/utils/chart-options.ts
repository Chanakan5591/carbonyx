import {
  type ChartOptions,
  type TooltipModel,
  Chart,
  type ChartItem,
  type TooltipItem,
} from "chart.js";

// Monthly Chart Options
const monthlyOptions: ChartOptions<"bar"> = {
  plugins: {
    title: {
      display: true,
      text: "Monthly Statistics of Carbon Emissions",
    },
    tooltip: {
      mode: "index", // Correct mode for showing tooltips across datasets
      intersect: false,
      callbacks: {
        label: function (context: TooltipItem<"bar">) {
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
        text: "Month",
      },
    },
    "y-axis-1": {
      stacked: true,
      type: "linear",
      position: "left",
      title: {
        display: true,
        text: "Stacked Emissions (kg CO₂e)",
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
        text: "Gross Emissions (kg CO₂e)",
      },
    },
  },
};

// Yearly Chart Options
const yearlyOptions: ChartOptions<"bar"> = {
  plugins: {
    title: {
      display: true,
      text: "Yearly Statistics of Carbon Emissions & Offset",
    },
    tooltip: {
      mode: "index", // Correct mode for showing tooltips across datasets
      intersect: false,
      callbacks: {
        label: function (context: TooltipItem<"bar">) {
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
        text: "Year",
      },
    },
    "y-axis-1": {
      stacked: true,
      type: "linear",
      position: "left",
      title: {
        display: true,
        text: "Stacked Emissions (kg CO₂e)",
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
        text: "Gross/Net Emissions (kg CO₂e)",
      },
    },
  },
};

export { monthlyOptions, yearlyOptions };
