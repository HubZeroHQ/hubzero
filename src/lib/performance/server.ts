import 'server-only';

import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import type {
  CommandFailedEvent,
  CommandStartedEvent,
  CommandSucceededEvent,
  ConnectionCheckedOutEvent,
  ConnectionCheckOutFailedEvent,
  MongoClient,
} from 'mongodb';
import { headers } from 'next/headers';

type TraceOutcome = 'ok' | 'error';

interface ServerPerformanceTrace {
  requestId: string;
  route: string;
  segment: string;
  startedAt: number;
  requestSequence: number;
  processAgeMs: number;
  mongoOperations: number;
  mongoDurationMs: number;
  firstMongoAtMs?: number;
  mongoFailures: number;
  clientAcquisitions: number;
  clientAcquisitionMs: number;
  clientAcquisitionMaxMs: number;
  coldClientAcquisitions: number;
  checkouts: number;
  checkoutDurationMs: number;
  checkoutMaxMs: number;
  checkoutFailures: number;
}

interface ProcessPerformanceState {
  instanceId: string;
  startedAt: number;
  requestSequence: number;
  connectionCreated: number;
  connectionClosed: number;
  currentConnections: number;
  clients: WeakSet<MongoClient>;
  commands: Map<number, ServerPerformanceTrace>;
}

declare global {
  var _hubzeroPerformanceState: ProcessPerformanceState | undefined;
}

const traceStorage = new AsyncLocalStorage<ServerPerformanceTrace>();

function telemetryEnabled(): boolean {
  return process.env.VERCEL_ENV === 'preview' || process.env.HUBZERO_PERFORMANCE_TELEMETRY === '1';
}

function processState(): ProcessPerformanceState {
  if (!globalThis._hubzeroPerformanceState) {
    globalThis._hubzeroPerformanceState = {
      instanceId: randomUUID().slice(0, 8),
      startedAt: performance.now(),
      requestSequence: 0,
      connectionCreated: 0,
      connectionClosed: 0,
      currentConnections: 0,
      clients: new WeakSet<MongoClient>(),
      commands: new Map<number, ServerPerformanceTrace>(),
    };
  }
  return globalThis._hubzeroPerformanceState;
}

export async function measureServerOperation<T>(
  route: string,
  segment: string,
  operation: () => Promise<T>,
): Promise<T> {
  if (!telemetryEnabled()) return operation();

  const state = processState();
  const requestSequence = ++state.requestSequence;
  const trace: ServerPerformanceTrace = {
    requestId: await requestId(),
    route,
    segment,
    startedAt: performance.now(),
    requestSequence,
    processAgeMs: performance.now() - state.startedAt,
    mongoOperations: 0,
    mongoDurationMs: 0,
    mongoFailures: 0,
    clientAcquisitions: 0,
    clientAcquisitionMs: 0,
    clientAcquisitionMaxMs: 0,
    coldClientAcquisitions: 0,
    checkouts: 0,
    checkoutDurationMs: 0,
    checkoutMaxMs: 0,
    checkoutFailures: 0,
  };

  let outcome: TraceOutcome = 'ok';
  let errorName: string | undefined;

  return traceStorage.run(trace, async () => {
    try {
      return await operation();
    } catch (error) {
      outcome = 'error';
      errorName = error instanceof Error ? error.name : 'UnknownError';
      throw error;
    } finally {
      emitPerformanceLog(trace, outcome, errorName);
    }
  });
}

export function recordMongoClientAcquisition(durationMs: number, reusedPromise: boolean): void {
  if (!telemetryEnabled()) return;
  const trace = traceStorage.getStore();
  if (!trace) return;
  trace.clientAcquisitions += 1;
  trace.clientAcquisitionMs += durationMs;
  trace.clientAcquisitionMaxMs = Math.max(trace.clientAcquisitionMaxMs, durationMs);
  if (!reusedPromise) trace.coldClientAcquisitions += 1;
}

export function instrumentMongoClient(client: MongoClient): void {
  if (!telemetryEnabled()) return;
  const state = processState();
  if (state.clients.has(client)) return;
  state.clients.add(client);

  client.on('connectionCreated', () => {
    state.connectionCreated += 1;
    state.currentConnections += 1;
  });
  client.on('connectionClosed', () => {
    state.connectionClosed += 1;
    state.currentConnections = Math.max(0, state.currentConnections - 1);
  });
  client.on('connectionCheckedOut', (event: ConnectionCheckedOutEvent) => {
    const trace = traceStorage.getStore();
    if (!trace) return;
    trace.checkouts += 1;
    trace.checkoutDurationMs += event.durationMS;
    trace.checkoutMaxMs = Math.max(trace.checkoutMaxMs, event.durationMS);
  });
  client.on('connectionCheckOutFailed', (event: ConnectionCheckOutFailedEvent) => {
    const trace = traceStorage.getStore();
    if (trace) trace.checkoutFailures += 1;
    emitMongoFailure('checkout', event.reason);
  });
  client.on('commandStarted', (event: CommandStartedEvent) => {
    const trace = traceStorage.getStore();
    if (!trace || event.databaseName === 'admin') return;
    trace.mongoOperations += 1;
    trace.firstMongoAtMs ??= performance.now() - trace.startedAt;
    state.commands.set(event.requestId, trace);
  });
  client.on('commandSucceeded', (event: CommandSucceededEvent) => {
    const trace = state.commands.get(event.requestId);
    if (!trace) return;
    trace.mongoDurationMs += event.duration;
    state.commands.delete(event.requestId);
  });
  client.on('commandFailed', (event: CommandFailedEvent) => {
    const trace = state.commands.get(event.requestId);
    if (trace) {
      trace.mongoFailures += 1;
      state.commands.delete(event.requestId);
    }
    emitMongoFailure('command', failureName(event.failure));
  });
}

export function recordMongoConnection(
  connectStartedAt: number,
  outcome: TraceOutcome,
  error?: unknown,
): void {
  if (!telemetryEnabled()) return;
  const state = processState();
  const trace = traceStorage.getStore();
  emitStructuredLog('mongo.connection', {
    outcome,
    instanceId: state.instanceId,
    requestId: trace?.requestId ?? null,
    route: trace?.route ?? null,
    segment: trace?.segment ?? null,
    connectMs: rounded(performance.now() - connectStartedAt),
    processAgeMs: rounded(performance.now() - state.startedAt),
    currentConnections: state.currentConnections,
    ...(outcome === 'error'
      ? { errorName: error instanceof Error ? error.name : 'UnknownError' }
      : {}),
  });
}

async function requestId(): Promise<string> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get('x-hubzero-request-id') ??
    requestHeaders.get('x-vercel-id') ??
    randomUUID().slice(0, 12)
  );
}

function emitPerformanceLog(
  trace: ServerPerformanceTrace,
  outcome: TraceOutcome,
  errorName: string | undefined,
): void {
  const state = processState();
  emitStructuredLog('server.performance', {
    requestId: trace.requestId,
    route: trace.route,
    segment: trace.segment,
    outcome,
    ...(errorName ? { errorName } : {}),
    instanceId: state.instanceId,
    requestSequence: trace.requestSequence,
    processAgeMs: rounded(trace.processAgeMs),
    segmentMs: rounded(performance.now() - trace.startedAt),
    firstMongoAtMs: trace.firstMongoAtMs === undefined ? null : rounded(trace.firstMongoAtMs),
    mongoOperations: trace.mongoOperations,
    mongoDurationMs: rounded(trace.mongoDurationMs),
    mongoFailures: trace.mongoFailures,
    clientAcquisitions: trace.clientAcquisitions,
    clientAcquisitionMs: rounded(trace.clientAcquisitionMs),
    clientAcquisitionMaxMs: rounded(trace.clientAcquisitionMaxMs),
    coldClientAcquisitions: trace.coldClientAcquisitions,
    checkouts: trace.checkouts,
    checkoutDurationMs: rounded(trace.checkoutDurationMs),
    checkoutMaxMs: rounded(trace.checkoutMaxMs),
    checkoutFailures: trace.checkoutFailures,
    poolConnectionsCreated: state.connectionCreated,
    poolConnectionsClosed: state.connectionClosed,
    poolConnectionsCurrent: state.currentConnections,
  });
}

function emitMongoFailure(kind: 'checkout' | 'command', reason: string): void {
  const state = processState();
  const trace = traceStorage.getStore();
  emitStructuredLog('mongo.failure', {
    kind,
    reason,
    requestId: trace?.requestId ?? null,
    route: trace?.route ?? null,
    segment: trace?.segment ?? null,
    instanceId: state.instanceId,
    processAgeMs: rounded(performance.now() - state.startedAt),
  });
}

function emitStructuredLog(event: string, values: Record<string, unknown>): void {
  console.log(`[hubzero-performance] ${JSON.stringify({ event, ...values })}`);
}

function failureName(failure: unknown): string {
  if (failure instanceof Error) return failure.name;
  if (typeof failure === 'object' && failure && 'codeName' in failure) {
    const codeName = (failure as { codeName?: unknown }).codeName;
    if (typeof codeName === 'string') return codeName;
  }
  return 'MongoCommandFailure';
}

function rounded(value: number): number {
  return Number(value.toFixed(1));
}
