const currencyFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const numberFormatter = new Intl.NumberFormat("en-US");

export function formatCurrency(amount: number | string) {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "0";
  return currencyFormatter.format(num) + " د.ع";
}

export function formatNumber(amount: number | string) {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "0";
  return numberFormatter.format(num);
}
