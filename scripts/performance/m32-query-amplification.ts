import { performance } from 'node:perf_hooks';
import { MongoClient, type CommandStartedEvent, type CommandSucceededEvent } from 'mongodb';

type OperationStats = {
  operations: number;
  databaseDurationMs: number;
  byCollection: Record<string, number>;
  byCommand: Record<string, number>;
};

type Measurement = OperationStats & {
  name: string;
  wallDurationMs: number;
  payloadBytes: number;
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required.');

  const client = new MongoClient(uri, { monitorCommands: true, maxPoolSize: 5 });
  await client.connect();

  // Application modules reuse this exact client, so command monitoring observes
  // the shipped repository paths without creating a second application pool.
  (
    globalThis as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> }
  )._mongoClientPromise = Promise.resolve(client);

  let active: OperationStats | null = null;
  const commands = new Map<number, { collection: string; command: string }>();

  client.on('commandStarted', (event: CommandStartedEvent) => {
    if (!active || event.databaseName === 'admin') return;
    const collection = collectionFor(event);
    active.operations += 1;
    active.byCollection[collection] = (active.byCollection[collection] ?? 0) + 1;
    active.byCommand[event.commandName] = (active.byCommand[event.commandName] ?? 0) + 1;
    commands.set(event.requestId, { collection, command: event.commandName });
  });

  client.on('commandSucceeded', (event: CommandSucceededEvent) => {
    if (!active || !commands.has(event.requestId)) return;
    active.databaseDurationMs += event.duration;
    commands.delete(event.requestId);
  });

  const [{ createPublicRepository }, { mongoPublicDataSource }] = await Promise.all([
    import('../../src/lib/public/repository'),
    import('../../src/lib/public/mongodb-source'),
  ]);
  const publicRepository = createPublicRepository(mongoPublicDataSource);

  const [
    { workRepository },
    { blueprintRepository },
    { leadRepository },
    { userRepository },
    { documentRepository },
    { getBlueprintRelationOptions },
    { resolveHeroAndGallery },
    { loadHealthReport },
    { loadEntryInspection },
    { loadEntryHistory },
    { listAllContent },
    { loadStudioContentSnapshot },
    { loadActivity },
  ] = await Promise.all([
    import('../../src/lib/db/repositories/work'),
    import('../../src/lib/db/repositories/blueprint'),
    import('../../src/lib/db/repositories/lead'),
    import('../../src/lib/db/repositories/user'),
    import('../../src/lib/db/repositories/document'),
    import('../../src/lib/studio/blueprint-relations'),
    import('../../src/lib/media/resolve'),
    import('../../src/lib/studio/health/service'),
    import('../../src/lib/studio/health/inspector'),
    import('../../src/lib/studio/history/service'),
    import('../../src/lib/studio/dashboard-queries'),
    import('../../src/lib/studio/request-data'),
    import('../../src/lib/studio/activity/service'),
  ]);

  const [work] = await workRepository.list();
  const [blueprint] = await blueprintRepository.list();
  const [user] = await userRepository.list();
  if (!work || !blueprint || !user) {
    throw new Error('The configured database needs representative Work, Blueprint, and User rows.');
  }

  async function measure(name: string, run: () => Promise<unknown>): Promise<Measurement> {
    console.error(`Measuring ${name}...`);
    active = { operations: 0, databaseDurationMs: 0, byCollection: {}, byCommand: {} };
    commands.clear();
    const startedAt = performance.now();
    const result = await run();
    const wallDurationMs = performance.now() - startedAt;
    const stats = active;
    active = null;
    if (!stats) throw new Error(`Measurement state was lost for ${name}.`);
    const measurement = {
      name,
      ...stats,
      wallDurationMs: Number(wallDurationMs.toFixed(1)),
      databaseDurationMs: Number(stats.databaseDurationMs.toFixed(1)),
      payloadBytes: Buffer.byteLength(JSON.stringify(result)),
    };
    console.error(`Measured ${name}: ${measurement.operations} operations.`);
    return measurement;
  }

  const measurements: Measurement[] = [];
  const requested = process.argv[2];
  const selected = (name: string) => !requested || requested === name;

  if (selected('homepage')) {
    measurements.push(await measure('homepage', () => publicRepository.getHomepage(new Date())));
  }
  if (selected('work-detail')) {
    measurements.push(
      await measure('work-detail', () => publicRepository.findDetail('work', work.slug)),
    );
  }
  if (selected('studio-health')) {
    measurements.push(await measure('studio-health', () => loadHealthReport()));
  }
  if (selected('studio-editor')) {
    measurements.push(
      await measure('studio-editor', async () => {
        const entry = await blueprintRepository.findById(blueprint._id.toString());
        if (!entry)
          throw new Error('Representative Blueprint disappeared during the read-only run.');
        const [document, options, media, inspection, history] = await Promise.all([
          documentRepository.findByOwnerAndRole('Blueprint', entry._id.toString(), 'caseStudy'),
          getBlueprintRelationOptions(),
          resolveHeroAndGallery(entry.heroImageId, entry.previewAssetIds),
          loadEntryInspection({
            collectionKey: 'blueprints',
            entryId: entry._id.toString(),
            editHref: `/studio/content/blueprints/${entry._id.toString()}/edit`,
          }),
          loadEntryHistory({ ownerType: 'Blueprint', entryId: entry._id.toString(), entry }),
        ]);
        return { entry, document, options, media, inspection, history };
      }),
    );
  }
  if (selected('dashboard')) {
    measurements.push(
      await measure('dashboard', async () => {
        const studioSnapshot = await loadStudioContentSnapshot();
        const [content, leads, health, activity] = await Promise.all([
          listAllContent(studioSnapshot),
          leadRepository.list(),
          loadHealthReport(new Date(), studioSnapshot),
          loadActivity({}, { role: 'headAdmin', userId: user._id.toString() }, { limit: 5 }),
        ]);
        return { content, leads, health, activity };
      }),
    );
  }

  process.stdout.write(`${JSON.stringify(measurements, null, 2)}\n`);
  await client.close();
  // Next's server-only helpers retain process handles when invoked from this
  // standalone harness. The measurements and Mongo client are complete here.
  process.exit(0);
}

function collectionFor(event: CommandStartedEvent): string {
  const command = event.command as Record<string, unknown>;
  for (const key of ['find', 'aggregate', 'count', 'distinct', 'insert', 'update', 'delete']) {
    if (typeof command[key] === 'string') return command[key];
  }
  return event.commandName;
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
