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

/**
 * Repayment progress 0–100. Never reports 100 while outstanding > 0
 * (avoids 99.996% rounding to 100.0% / 100%).
 */
export function repaymentProgressPct(
  totalPaidPaise: number,
  totalRepaymentPaise: number,
  outstandingPaise: number,
  decimals = 1,
): number {
  if (totalRepaymentPaise <= 0) return 0;
  if (outstandingPaise <= 0) return 100;
  const raw = (totalPaidPaise / totalRepaymentPaise) * 100;
  const factor = 10 ** decimals;
  const floored = Math.floor(raw * factor) / factor;
  const maxBelowFull = 100 - 1 / factor;
  return Math.min(maxBelowFull, Math.max(0, floored));
}
