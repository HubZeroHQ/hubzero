export interface Distribution {
  min: number;
  p50: number;
  p75: number;
  p95: number;
  max: number;
}

export function distribution(values: readonly number[]): Distribution {
  if (values.length === 0) {
    throw new Error('A performance distribution requires at least one sample.');
  }

  const sorted = [...values].sort((left, right) => left - right);
  return {
    min: rounded(sorted[0] ?? 0),
    p50: percentile(sorted, 0.5),
    p75: percentile(sorted, 0.75),
    p95: percentile(sorted, 0.95),
    max: rounded(sorted.at(-1) ?? 0),
  };
}

function percentile(sorted: readonly number[], percentileValue: number): number {
  const index = Math.max(0, Math.ceil(sorted.length * percentileValue) - 1);
  return rounded(sorted[index] ?? 0);
}

function rounded(value: number): number {
  return Number(value.toFixed(1));
}
