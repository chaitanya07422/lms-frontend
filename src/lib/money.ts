const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const rupeeFormatterExact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Convert whole rupees (UI) to integer paise. */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Convert integer paise to rupees for display/input. */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function formatPaise(paise: number, exact = false): string {
  const rupees = paiseToRupees(paise);
  return exact ? rupeeFormatterExact.format(rupees) : rupeeFormatter.format(rupees);
}
