// Months for the x-axis (2022-2023)
const months = [
  "Jan 2022",
  "Feb 2022",
  "Mar 2022",
  "Apr 2022",
  "May 2022",
  "Jun 2022",
  "Jul 2022",
  "Aug 2022",
  "Sep 2022",
  "Oct 2022",
  "Nov 2022",
  "Dec 2022",
  "Jan 2023",
  "Feb 2023",
  "Mar 2023",
  "Apr 2023",
  "May 2023",
  "Jun 2023",
  "Jul 2023",
  "Aug 2023",
  "Sep 2023",
  "Oct 2023",
  "Nov 2023",
  "Dec 2023",
];

type MonthlyEmissions = {
  month: string;
  emissions: number; // in kg CO2e
};

type EmissionSource = {
  label: string;
  data: MonthlyEmissions[];
  backgroundColor?: string;
  borderColor?: string;
};

// Mock Data with Realistic Monthly Trends
const carbonEmissionData: EmissionSource[] = [
  {
    label: "Electricity Consumption",
    data: [
      { month: "Jan 2022", emissions: 23000 },
      { month: "Feb 2022", emissions: 21000 },
      { month: "Mar 2022", emissions: 19000 },
      { month: "Apr 2022", emissions: 17000 },
      { month: "May 2022", emissions: 18000 },
      { month: "Jun 2022", emissions: 20000 },
      { month: "Jul 2022", emissions: 22000 },
      { month: "Aug 2022", emissions: 23000 },
      { month: "Sep 2022", emissions: 19000 },
      { month: "Oct 2022", emissions: 18000 },
      { month: "Nov 2022", emissions: 20000 },
      { month: "Dec 2022", emissions: 22000 },
      { month: "Jan 2023", emissions: 21000 },
      { month: "Feb 2023", emissions: 19000 },
      { month: "Mar 2023", emissions: 17000 },
      { month: "Apr 2023", emissions: 16000 },
      { month: "May 2023", emissions: 17000 },
      { month: "Jun 2023", emissions: 19000 },
      { month: "Jul 2023", emissions: 21000 },
      { month: "Aug 2023", emissions: 22000 },
      { month: "Sep 2023", emissions: 18000 },
      { month: "Oct 2023", emissions: 17000 },
      { month: "Nov 2023", emissions: 19000 },
      { month: "Dec 2023", emissions: 20000 },
    ],
    backgroundColor: "rgba(75, 192, 192, 0.2)",
  },
  {
    label: "Transportation (Fuel)",
    data: [
      { month: "Jan 2022", emissions: 10000 },
      { month: "Feb 2022", emissions: 9500 },
      { month: "Mar 2022", emissions: 10500 },
      { month: "Apr 2022", emissions: 11000 },
      { month: "May 2022", emissions: 12000 },
      { month: "Jun 2022", emissions: 12500 },
      { month: "Jul 2022", emissions: 13000 },
      { month: "Aug 2022", emissions: 12000 },
      { month: "Sep 2022", emissions: 11000 },
      { month: "Oct 2022", emissions: 10500 },
      { month: "Nov 2022", emissions: 9500 },
      { month: "Dec 2022", emissions: 9000 },
      { month: "Jan 2023", emissions: 8500 },
      { month: "Feb 2023", emissions: 9000 },
      { month: "Mar 2023", emissions: 10000 },
      { month: "Apr 2023", emissions: 10500 },
      { month: "May 2023", emissions: 11500 },
      { month: "Jun 2023", emissions: 12000 },
      { month: "Jul 2023", emissions: 12500 },
      { month: "Aug 2023", emissions: 11500 },
      { month: "Sep 2023", emissions: 10500 },
      { month: "Oct 2023", emissions: 10000 },
      { month: "Nov 2023", emissions: 9000 },
      { month: "Dec 2023", emissions: 8500 },
    ],
    backgroundColor: "rgba(255, 206, 86, 0.2)",
  },
  {
    label: "Natural Gas Usage",
    data: [
      { month: "Jan 2022", emissions: 12000 },
      { month: "Feb 2022", emissions: 11000 },
      { month: "Mar 2022", emissions: 9000 },
      { month: "Apr 2022", emissions: 7000 },
      { month: "May 2022", emissions: 5000 },
      { month: "Jun 2022", emissions: 4000 },
      { month: "Jul 2022", emissions: 4500 },
      { month: "Aug 2022", emissions: 5000 },
      { month: "Sep 2022", emissions: 6000 },
      { month: "Oct 2022", emissions: 7500 },
      { month: "Nov 2022", emissions: 9000 },
      { month: "Dec 2022", emissions: 11000 },
      { month: "Jan 2023", emissions: 10000 },
      { month: "Feb 2023", emissions: 9500 },
      { month: "Mar 2023", emissions: 8000 },
      { month: "Apr 2023", emissions: 6500 },
      { month: "May 2023", emissions: 4500 },
      { month: "Jun 2023", emissions: 3500 },
      { month: "Jul 2023", emissions: 4000 },
      { month: "Aug 2023", emissions: 4500 },
      { month: "Sep 2023", emissions: 5500 },
      { month: "Oct 2023", emissions: 7000 },
      { month: "Nov 2023", emissions: 8500 },
      { month: "Dec 2023", emissions: 9500 },
    ],
    backgroundColor: "rgba(54, 162, 235, 0.2)",
  },
  {
    label: "Waste Disposal",
    data: [
      { month: "Jan 2022", emissions: 2500 },
      { month: "Feb 2022", emissions: 2400 },
      { month: "Mar 2022", emissions: 2600 },
      { month: "Apr 2022", emissions: 2500 },
      { month: "May 2022", emissions: 2700 },
      { month: "Jun 2022", emissions: 2800 },
      { month: "Jul 2022", emissions: 2900 },
      { month: "Aug 2022", emissions: 2800 },
      { month: "Sep 2022", emissions: 2600 },
      { month: "Oct 2022", emissions: 2500 },
      { month: "Nov 2022", emissions: 2400 },
      { month: "Dec 2022", emissions: 2300 },
      { month: "Jan 2023", emissions: 2200 },
      { month: "Feb 2023", emissions: 2100 },
      { month: "Mar 2023", emissions: 2300 },
      { month: "Apr 2023", emissions: 2200 },
      { month: "May 2023", emissions: 2400 },
      { month: "Jun 2023", emissions: 2500 },
      { month: "Jul 2023", emissions: 2600 },
      { month: "Aug 2023", emissions: 2500 },
      { month: "Sep 2023", emissions: 2300 },
      { month: "Oct 2023", emissions: 2200 },
      { month: "Nov 2023", emissions: 2100 },
      { month: "Dec 2023", emissions: 2000 },
    ],
    backgroundColor: "rgba(255, 99, 132, 0.2)",
  },
];

const carbonOffsetData: EmissionSource = {
  label: "Carbon Offset Purchases",
  data: [
    { month: "Jan 2022", emissions: -1000 }, // Offset should be negative
    { month: "Feb 2022", emissions: -1500 },
    { month: "Mar 2022", emissions: -2000 },
    { month: "Apr 2022", emissions: -2500 },
    { month: "May 2022", emissions: -3000 },
    { month: "Jun 2022", emissions: -3500 },
    { month: "Jul 2022", emissions: -4000 },
    { month: "Aug 2022", emissions: -4500 },
    { month: "Sep 2022", emissions: -5000 },
    { month: "Oct 2022", emissions: -5500 },
    { month: "Nov 2022", emissions: -6000 },
    { month: "Dec 2022", emissions: -6500 },
    { month: "Jan 2023", emissions: -7000 },
    { month: "Feb 2023", emissions: -7500 },
    { month: "Mar 2023", emissions: -8000 },
    { month: "Apr 2023", emissions: -8500 },
    { month: "May 2023", emissions: -9000 },
    { month: "Jun 2023", emissions: -9500 },
    { month: "Jul 2023", emissions: -10000 },
    { month: "Aug 2023", emissions: -10500 },
    { month: "Sep 2023", emissions: -11000 },
    { month: "Oct 2023", emissions: -11500 },
    { month: "Nov 2023", emissions: -12000 },
    { month: "Dec 2023", emissions: -12500 },
  ],
  backgroundColor: "rgba(0, 128, 0, 0.2)", // Green for offsets
};

// Add offset data to the main data array
carbonEmissionData.push(carbonOffsetData);

// --- Calculations for Gross and Net Emissions ---

// Calculate Gross Emissions per month (before offsets)
const grossEmissions: MonthlyEmissions[] = [];
for (const month of months) {
  let monthlyGross = 0;
  for (const source of carbonEmissionData) {
    // Exclude carbon offset data for gross calculation
    if (source.label !== "Carbon Offset Purchases") {
      const emissionData = source.data.find((d) => d.month === month);
      if (emissionData) {
        monthlyGross += emissionData.emissions;
      }
    }
  }
  grossEmissions.push({ month, emissions: monthlyGross });
}

// Calculate Net Emissions per month (including offsets)
const netEmissions: MonthlyEmissions[] = [];
for (const month of months) {
  let monthlyNet = 0;
  for (const source of carbonEmissionData) {
    const emissionData = source.data.find((d) => d.month === month);
    if (emissionData) {
      monthlyNet += emissionData.emissions;
    }
  }
  netEmissions.push({ month, emissions: monthlyNet });
}

// --- Chart Data Preparation ---
// ... your existing code ...

// Transform data for Chart.js
const chartData = {
  labels: months,
  datasets: carbonEmissionData.map((source) => ({
    label: source.label,
    data: months.map((month) => {
      const emissionData = source.data.find((d) => d.month === month);
      return emissionData ? emissionData.emissions : 0;
    }),
    borderWidth: source.label === "Carbon Offset Purchases" ? 3 : 1,
    backgroundColor: source.backgroundColor,
    borderColor: source.borderColor,
    type: source.label === "Carbon Offset Purchases" ? "line" : undefined,
    yAxisID:
      source.label === "Carbon Offset Purchases" ? "y-axis-2" : "y-axis-1", // Assign the carbon offset data to the second y-axis
  })),
};

// Add Gross and Net Emissions as line datasets
chartData.datasets.push(
  {
    label: "Gross Emissions",
    data: grossEmissions.map((d) => d.emissions),
    borderWidth: 3,
    borderColor: "rgba(255, 0, 0, 1)", // Red for gross
    type: "line",
    order: 1, // Set order for line layering
    yAxisID: "y-axis-2", // Assign to the second y-axis
  },
  {
    label: "Net Emissions",
    data: netEmissions.map((d) => d.emissions),
    borderWidth: 3,
    borderColor: "rgba(0, 0, 0, 1)", // Black for net
    type: "line",
    order: 0, // Ensure net line is drawn on top
    yAxisID: "y-axis-2", // Assign to the second y-axis
  },
);

// Latest and previous month's Gross Emissions
const latestGrossEmissionsTonnes =
  grossEmissions.length > 0
    ? grossEmissions[grossEmissions.length - 1].emissions / 1000
    : 0;
const previousGrossEmissionsTonnes =
  grossEmissions.length > 1
    ? grossEmissions[grossEmissions.length - 2].emissions / 1000
    : 0;

// Latest and previous month's Net Emissions
const latestNetEmissionsTonnes =
  netEmissions.length > 0
    ? netEmissions[netEmissions.length - 1].emissions / 1000
    : 0;
const previousNetEmissionsTonnes =
  netEmissions.length > 1
    ? netEmissions[netEmissions.length - 2].emissions / 1000
    : 0;

// Latest and previous month's Offset Emissions (absolute value for display)
const latestOffsetTonnes =
  carbonOffsetData.data.length > 0
    ? Math.abs(
        carbonOffsetData.data[carbonOffsetData.data.length - 1].emissions,
      ) / 1000
    : 0;
const previousOffsetTonnes =
  carbonOffsetData.data.length > 1
    ? Math.abs(
        carbonOffsetData.data[carbonOffsetData.data.length - 2].emissions,
      ) / 1000
    : 0;

export {
  chartData,
  latestGrossEmissionsTonnes,
  previousGrossEmissionsTonnes,
  latestNetEmissionsTonnes,
  previousNetEmissionsTonnes,
  latestOffsetTonnes,
  previousOffsetTonnes,
};
