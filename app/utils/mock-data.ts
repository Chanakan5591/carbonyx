type YearlyEmissions = {
  year: number;
  emissions: number; // in kg CO2e
};

type EmissionSource = {
  label: string;
  data: YearlyEmissions[];
};

// Mock Data (same as before but included here for completeness)
const carbonEmissionData: EmissionSource[] = [
  {
    label: "Electricity Consumption",
    data: [
      { year: 2018, emissions: 2580000 },
      { year: 2019, emissions: 2450000 },
      { year: 2020, emissions: 2200000 },
      { year: 2021, emissions: 2310000 },
      { year: 2022, emissions: 2100000 },
      { year: 2023, emissions: 1950000 },
    ],
    backgroundColor: "rgba(75, 192, 192, 0.2)",
  },
  {
    label: "Transportation (Fuel)",
    data: [
      { year: 2018, emissions: 1200000 },
      { year: 2019, emissions: 1250000 },
      { year: 2020, emissions: 980000 },
      { year: 2021, emissions: 1100000 },
      { year: 2022, emissions: 1150000 },
      { year: 2023, emissions: 1050000 },
    ],
    backgroundColor: "rgba(255, 206, 86, 0.2)",
  },
  {
    label: "Natural Gas Usage",
    data: [
      { year: 2018, emissions: 850000 },
      { year: 2019, emissions: 880000 },
      { year: 2020, emissions: 820000 },
      { year: 2021, emissions: 860000 },
      { year: 2022, emissions: 800000 },
      { year: 2023, emissions: 750000 },
    ],
    backgroundColor: "rgba(54, 162, 235, 0.2)",
  },
  {
    label: "Waste Disposal",
    data: [
      { year: 2018, emissions: 300000 },
      { year: 2019, emissions: 280000 },
      { year: 2020, emissions: 250000 },
      { year: 2021, emissions: 260000 },
      { year: 2022, emissions: 240000 },
      { year: 2023, emissions: 220000 },
    ],
    backgroundColor: "rgba(255, 99, 132, 0.2)",
  },
];

// Years for the x-axis
const years = [2018, 2019, 2020, 2021, 2022, 2023];

// Transform data for Chart.js
const chartData = {
  labels: years.map(String), // Years as strings for x-axis labels
  datasets: carbonEmissionData.map((source) => ({
    label: source.label,
    data: years.map((year) => {
      const emissionData = source.data.find((d) => d.year === year);
      return emissionData ? emissionData.emissions : 0; // Handle missing data
    }),
    borderWidth: 1,
    // Add more styling options here if needed (e.g., backgroundColor)
    backgroundColor: source.backgroundColor,
  })),
};

// Calculate total emissions per year
const totalEmissions: YearlyEmissions[] = [];
for (const year of years) {
  let yearlyTotal = 0;
  for (const source of carbonEmissionData) {
    const emissionData = source.data.find((d) => d.year === year);
    if (emissionData) {
      yearlyTotal += emissionData.emissions;
    }
  }
  totalEmissions.push({ year, emissions: yearlyTotal });
}

// Add total emissions as a line dataset
chartData.datasets.push({
  label: "Total Emissions",
  data: totalEmissions.map((d) => d.emissions),
  borderWidth: 3,
  borderColor: "rgba(0, 0, 0, 1)", // Example: Make the line black and solid
  type: "line", // Make it a line dataset
  order: 0, // Draw the line on top of the bars
});

export { chartData };
