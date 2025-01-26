type MonthlyEmissions = {
  month: string;
  emissions: number; // in kg CO2e
};

type EmissionSource = {
  label: string;
  data: MonthlyEmissions[];
  backgroundColor?: string;
};

type OffsetData = {
  year: number;
  tco2e: number;
  price_per_tco2e: number;
};

type YearlyData = {
  grossEmissions: MonthlyEmissions[];
  netEmissions: MonthlyEmissions[];
  offsetData: OffsetData[];
  emissionSources: EmissionSource[];
};

type ChartData = {
  labels: string[];
  datasets: any[];
};

type DataOutput = {
  monthly: YearlyData;
  yearly: YearlyData;
  allData: {
    emissionSources: EmissionSource[];
    offsetData: OffsetData[];
  };
};
