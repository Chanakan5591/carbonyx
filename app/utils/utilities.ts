import type { CollectedData } from "~/db/schema";
import { format } from "date-fns-tz";
import { fromUnixTime } from "date-fns";

export function formatNumber(value: number): string {
  if (value >= 1000) {
    const suffixes: string[] = ["", "k", "M", "B", "T"];
    const suffixNum: number = Math.floor(("" + value).length / 3);
    let shortValue: number | string = parseFloat(
      (suffixNum !== 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(
        2,
      ),
    );
    if (shortValue % 1 !== 0) {
      shortValue = shortValue.toFixed(1);
    }
    return shortValue + suffixes[suffixNum];
  }
  return value.toString();
}

interface CategorizedData {
  [key: string]: CollectedData[];
}

export function categorizeDateByMonth(
  data: CollectedData[],
  clientTimezone: string = "Asia/Bangkok",
) {
  // might allow modifications of timezone by the client later.
  return data.reduce<CategorizedData>((acc, item) => {
    const zonedDate = fromUnixTime(item.timestamp);
    const monthYearKey = format(zonedDate, "yyyy-MM", {
      timeZone: clientTimezone,
    });

    if (!acc[monthYearKey]) {
      acc[monthYearKey] = [];
    }

    acc[monthYearKey].push(item);
    return acc;
  }, {});
}
