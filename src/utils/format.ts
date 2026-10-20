export function formatCurrency(amount: number | string): string {
  let numAmount = 0;
  if (typeof amount === 'number') {
    numAmount = amount;
  } else if (typeof amount === 'string') {
    numAmount = parseFloat(amount) || 0;
  }

  // Format as Pakistani Rupee
  const formatted = Math.round(numAmount).toLocaleString('en-PK');
  return `₨ ${formatted}`;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
  return `ORD-${year}${month}${day}-${randomStr}`;
}
