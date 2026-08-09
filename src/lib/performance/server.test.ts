import { EventEmitter } from 'node:events';
import type { MongoClient } from 'mongodb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  instrumentMongoClient,
  measureServerOperation,
  recordMongoClientAcquisition,
  recordMongoConnection,
} from './server';

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers({ 'x-hubzero-request-id': 'request-test' })),
}));

describe('server performance telemetry', () => {
  const originalTelemetry = process.env.HUBZERO_PERFORMANCE_TELEMETRY;

  beforeEach(() => {
    process.env.HUBZERO_PERFORMANCE_TELEMETRY = '1';
    globalThis._hubzeroPerformanceState = undefined;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalTelemetry === undefined) {
      delete process.env.HUBZERO_PERFORMANCE_TELEMETRY;
    } else {
      process.env.HUBZERO_PERFORMANCE_TELEMETRY = originalTelemetry;
    }
    globalThis._hubzeroPerformanceState = undefined;
  });

  it('aggregates MongoDB work without logging query or document data', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const events = new EventEmitter();
    const client = events as unknown as MongoClient;
    instrumentMongoClient(client);

    const result = await measureServerOperation('/studio/health', 'health-report', async () => {
      recordMongoClientAcquisition(2.25, true);
      events.emit('connectionCreated', {});
      events.emit('connectionCheckedOut', { durationMS: 3.5 });
      events.emit('commandStarted', {
        requestId: 41,
        databaseName: 'hubzero',
        commandName: 'find',
        command: { find: 'documents', filter: { private: 'must-not-be-logged' } },
      });
      events.emit('commandSucceeded', { requestId: 41, duration: 7.5 });
      return 'ok';
    });

    expect(result).toBe('ok');
    expect(log).toHaveBeenCalledTimes(1);
    const payload = parsePerformanceLog(log.mock.calls[0]?.[0]);
    expect(payload).toMatchObject({
      event: 'server.performance',
      requestId: 'request-test',
      route: '/studio/health',
      segment: 'health-report',
      outcome: 'ok',
      mongoOperations: 1,
      mongoDurationMs: 7.5,
      clientAcquisitions: 1,
      clientAcquisitionMs: 2.3,
      checkouts: 1,
      checkoutDurationMs: 3.5,
      poolConnectionsCreated: 1,
      poolConnectionsCurrent: 1,
    });
    expect(JSON.stringify(payload)).not.toContain('must-not-be-logged');
    expect(JSON.stringify(payload)).not.toContain('documents');
  });

  it('records only the error class when measured work fails', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await expect(
      measureServerOperation('/search', 'page', async () => {
        throw new TypeError('private request content');
      }),
    ).rejects.toThrow('private request content');

    const payload = parsePerformanceLog(log.mock.calls[0]?.[0]);
    expect(payload).toMatchObject({ outcome: 'error', errorName: 'TypeError' });
    expect(JSON.stringify(payload)).not.toContain('private request content');
  });

  it('correlates connection failures without logging the private error message', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await measureServerOperation('/studio/dashboard', 'page', async () => {
      recordMongoConnection(performance.now(), 'error', new Error('private connection detail'));
    });

    const payload = parsePerformanceLog(log.mock.calls[0]?.[0]);
    expect(payload).toMatchObject({
      event: 'mongo.connection',
      outcome: 'error',
      requestId: 'request-test',
      route: '/studio/dashboard',
      segment: 'page',
      errorName: 'Error',
    });
    expect(JSON.stringify(payload)).not.toContain('private connection detail');
  });

  it('does not emit telemetry outside preview or an explicit controlled run', async () => {
    delete process.env.HUBZERO_PERFORMANCE_TELEMETRY;
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await measureServerOperation('/work', 'page', async () => 'ok');

    expect(log).not.toHaveBeenCalled();
  });
});

function parsePerformanceLog(value: unknown): Record<string, unknown> {
  expect(typeof value).toBe('string');
  const prefix = '[hubzero-performance] ';
  expect((value as string).startsWith(prefix)).toBe(true);
  return JSON.parse((value as string).slice(prefix.length)) as Record<string, unknown>;
}
