import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { distribution } from '../../src/lib/performance/statistics';

interface Measurement {
  name: string;
  operations: number;
  databaseDurationMs: number;
  wallDurationMs: number;
  payloadBytes: number;
  byCollection: Record<string, number>;
  byCommand: Record<string, number>;
}

const operationBudgets = {
  homepage: 40,
  'work-detail': 13,
  'studio-health': 45,
  'studio-editor': 56,
  dashboard: 64,
} as const;

type CompositionName = keyof typeof operationBudgets;

async function main() {
  const samples = positiveInteger(option('samples') ?? process.env.PERFORMANCE_SAMPLES ?? '3');
  const requested = process.argv.find((value) => isCompositionName(value));
  const runs: Measurement[][] = [];

  for (let sample = 1; sample <= samples; sample += 1) {
    process.stderr.write(`Running isolated M32 sample ${sample}/${samples}...\n`);
    runs.push(runHarness(requested));
  }

  const expectedNames = requested ? [requested] : Object.keys(operationBudgets);
  const results = expectedNames.map((name) => summarize(name as CompositionName, runs));
  const violations = results.flatMap((result) => {
    const findings: string[] = [];
    if (result.operations.max > result.operationBudget) {
      findings.push(
        `${result.name} used ${result.operations.max} operations; budget is ${result.operationBudget}.`,
      );
    }
    if (!result.operationShapeStable) {
      findings.push(`${result.name} changed collection or command shape between samples.`);
    }
    return findings;
  });

  process.stdout.write(
    `${JSON.stringify(
      {
        protocol: {
          samples,
          processIsolation: 'fresh process and MongoClient per sample',
          cacheState: 'warm client within each composition run',
          environment: process.env.PERFORMANCE_ENVIRONMENT ?? 'local-controlled',
          revision: process.env.PERFORMANCE_REVISION ?? 'working-tree',
        },
        results,
        operationBudgetStatus: violations.length === 0 ? 'pass' : 'fail',
        violations,
      },
      null,
      2,
    )}\n`,
  );

  if (violations.length > 0) process.exitCode = 1;
}

function runHarness(requested: CompositionName | undefined): Measurement[] {
  const script = path.resolve('scripts/performance/m32-query-amplification.ts');
  const result = spawnSync(
    process.execPath,
    ['--conditions=react-server', '--import', 'tsx', script, ...(requested ? [requested] : [])],
    {
      cwd: process.cwd(),
      env: process.env,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  if (result.status !== 0) {
    if (result.stderr) process.stderr.write(result.stderr);
    throw new Error(`M32 harness exited with status ${result.status ?? 'unknown'}.`);
  }

  try {
    return JSON.parse(result.stdout) as Measurement[];
  } catch {
    throw new Error('M32 harness did not return valid JSON.');
  }
}

function summarize(name: CompositionName, runs: readonly Measurement[][]) {
  const measurements = runs.map((run) => {
    const matches = run.filter((measurement) => measurement.name === name);
    if (matches.length !== 1) {
      throw new Error(`Expected exactly one ${name} measurement in every sample.`);
    }
    return matches[0] as Measurement;
  });

  const collectionShapes = new Set(
    measurements.map((measurement) => stableShape(measurement.byCollection)),
  );
  const commandShapes = new Set(
    measurements.map((measurement) => stableShape(measurement.byCommand)),
  );

  return {
    name,
    samples: measurements.length,
    operationBudget: operationBudgets[name],
    operations: distribution(measurements.map((measurement) => measurement.operations)),
    wallDurationMs: distribution(measurements.map((measurement) => measurement.wallDurationMs)),
    databaseDurationMs: distribution(
      measurements.map((measurement) => measurement.databaseDurationMs),
    ),
    payloadBytes: distribution(measurements.map((measurement) => measurement.payloadBytes)),
    operationShapeStable: collectionShapes.size === 1 && commandShapes.size === 1,
  };
}

function stableShape(shape: Readonly<Record<string, number>>): string {
  return JSON.stringify(Object.entries(shape).sort(([left], [right]) => left.localeCompare(right)));
}

function positiveInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error('--samples must be a positive integer.');
  }
  return parsed;
}

function isCompositionName(value: string): value is CompositionName {
  return value in operationBudgets;
}

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'M32 regression measurement failed.');
  process.exitCode = 1;
});
