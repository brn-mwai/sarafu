export function kes(amount: number): string {
  return `KES ${Math.round(amount).toLocaleString('en-KE')}`;
}

export function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
