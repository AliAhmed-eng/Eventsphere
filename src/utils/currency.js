export function formatCurrency(price) {
  const num = Number(price) || 0;
  return `Rs. ${num.toLocaleString("en-PK")}`;
}
