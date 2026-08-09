import { performance } from 'node:perf_hooks';
import { distribution } from '../../src/lib/performance/statistics';

const defaultRoutes = [
  '/',
  '/work',
  '/builds',
  '/blueprints',
  '/labs',
  '/notes',
  '/engineering',
  '/careers',
  '/search?q=blueprint',
  '/work/bhatkal-time-luxe',
  '/blueprints/corporate-editorial',
  '/labs/nexus',
];

type Sample = {
  ttfbMs: number;
  totalMs: number;
  bytes: number;
  status: number;
  cache: string;
  cacheControl: string;
};

async function main() {
  const baseUrl = option('base-url') ?? process.env.PERFORMANCE_BASE_URL;
  if (!baseUrl) {
    throw new Error('Pass --base-url=https://example.com or set PERFORMANCE_BASE_URL.');
  }

  const samples = Number(option('samples') ?? process.env.PERFORMANCE_SAMPLES ?? '20');
  if (!Number.isInteger(samples) || samples < 1) {
    throw new Error('--samples must be a positive integer.');
  }

  const routes = process.argv.slice(2).filter((value) => value.startsWith('/'));
  const selectedRoutes = routes.length ? routes : defaultRoutes;
  const headers: HeadersInit = {};
  if (process.env.VERCEL_PROTECTION_BYPASS) {
    headers['x-vercel-protection-bypass'] = process.env.VERCEL_PROTECTION_BYPASS;
  }

  const results = [];
  for (const route of selectedRoutes) {
    const warmup = await measure(new URL(route, baseUrl), headers);
    const measured: Sample[] = [];
    for (let index = 0; index < samples; index += 1) {
      measured.push(await measure(new URL(route, baseUrl), headers));
    }

    const statuses = [...new Set(measured.map((sample) => sample.status))];
    results.push({
      route,
      samples: measured.length,
      warmup: summarizeOne(warmup),
      status: statuses,
      cache: [...new Set(measured.map((sample) => sample.cache))],
      cacheControl: [...new Set(measured.map((sample) => sample.cacheControl))],
      ttfbMs: distribution(measured.map((sample) => sample.ttfbMs)),
      totalMs: distribution(measured.map((sample) => sample.totalMs)),
      bytes: distribution(measured.map((sample) => sample.bytes)),
    });
  }

  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
}

async function measure(url: URL, headers: HeadersInit): Promise<Sample> {
  const startedAt = performance.now();
  const response = await fetch(url, { headers, redirect: 'manual' });
  const ttfbMs = performance.now() - startedAt;
  const body = await response.arrayBuffer();
  return {
    ttfbMs,
    totalMs: performance.now() - startedAt,
    bytes: body.byteLength,
    status: response.status,
    cache: response.headers.get('x-vercel-cache') ?? 'none',
    cacheControl: response.headers.get('cache-control') ?? 'none',
  };
}

function summarizeOne(sample: Sample) {
  return {
    status: sample.status,
    cache: sample.cache,
    ttfbMs: rounded(sample.ttfbMs),
    totalMs: rounded(sample.totalMs),
    bytes: sample.bytes,
  };
}

function rounded(value: number) {
  return Number(value.toFixed(1));
}

function option(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Performance measurement failed.');
  process.exitCode = 1;
});
