function formatNumber(value: number): string {
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
export { formatNumber };
