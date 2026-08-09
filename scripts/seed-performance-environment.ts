import { createHash } from 'node:crypto';
import { hash } from 'bcryptjs';
import { MongoClient, ObjectId, type Document } from 'mongodb';
import { blueprintSchema } from '../src/lib/validation/blueprint';
import { buildSchema } from '../src/lib/validation/build';
import { careerSchema } from '../src/lib/validation/career';
import { engineeringProfileSchema } from '../src/lib/validation/engineering-profile';
import { labSchema } from '../src/lib/validation/lab';
import { leadSchema } from '../src/lib/validation/lead';
import { mediaAssetSchema } from '../src/lib/validation/media';
import { noteSchema } from '../src/lib/validation/note';
import { serviceSchema } from '../src/lib/validation/service';
import { studioSettingsSchema } from '../src/lib/validation/settings';
import { taxonomyEntrySchema } from '../src/lib/validation/taxonomy';
import { teamSchema } from '../src/lib/validation/team';
import { userSchema } from '../src/lib/validation/user';
import { workSchema } from '../src/lib/validation/work';
import { documentSchema } from '../src/lib/documents/schema';
import { editorialEventSchema } from '../src/lib/events/schema';

const ALLOWED_DATABASE = 'hubzero_perf_m32';
const FIXTURE_NAMESPACE = 'hubzero-perf-m32';
const FIXED_DATE = new Date('2026-08-01T00:00:00.000Z');

type FixtureCollection = { name: string; records: Document[] };
type DenseArray<T> = readonly T[] & { readonly [index: number]: T };

function dense<T>(values: readonly T[]): DenseArray<T> {
  return values as DenseArray<T>;
}

function at<T>(values: readonly T[], index: number): T {
  const value = values[index];
  if (value === undefined) throw new Error(`Missing deterministic fixture at index ${index}.`);
  return value;
}

function id(label: string): ObjectId {
  return new ObjectId(
    createHash('sha256').update(`${FIXTURE_NAMESPACE}:${label}`).digest('hex').slice(0, 24),
  );
}

function databaseName(uri: string): string {
  const parsed = new URL(uri.replace(/^mongodb(\+srv)?:\/\//, 'https://'));
  return decodeURIComponent(parsed.pathname.replace(/^\//, ''));
}

function withTimestamps(input: object, label: string, extra: object = {}): Document {
  return { _id: id(label), ...input, ...extra, createdAt: FIXED_DATE, updatedAt: FIXED_DATE };
}

function status(index: number) {
  if (index < 2) return 'published' as const;
  return at(['inReview', 'draft', 'approved', 'archived'] as const, (index - 2) % 4);
}

function longText(label: string): string {
  return Array.from(
    { length: 70 },
    (_, index) => `${label} synthetic engineering evidence ${index + 1}`,
  ).join(' ');
}

function convertInputIds(input: Record<string, unknown>): Record<string, unknown> {
  return input;
}

async function fixtures(
  memberPassword: string,
  adminPassword: string,
): Promise<FixtureCollection[]> {
  const memberId = id('user:member');
  const adminId = id('user:admin');
  const unlinkedAuthorId = id('user:unlinked-public-author');
  const userInputs = [
    userSchema.parse({
      name: 'M32 Performance Member',
      email: 'm32-member@hubzero.invalid',
      role: 'member',
      passwordHash: await hash(memberPassword, 12),
      disabled: false,
      mustChangePassword: false,
    }),
    userSchema.parse({
      name: 'M32 Performance Administrator',
      email: 'm32-admin@hubzero.invalid',
      role: 'admin',
      passwordHash: await hash(adminPassword, 12),
      disabled: false,
      mustChangePassword: false,
    }),
  ];
  const users = userInputs.map((input, index) =>
    withTimestamps(input, index === 0 ? 'user:member' : 'user:admin'),
  );

  const mediaIds = dense(Array.from({ length: 24 }, (_, index) => id(`media:${index + 1}`)));
  const media = mediaIds.map((mediaId, index) =>
    withTimestamps(
      mediaAssetSchema.parse({
        cloudinaryPublicId: `${FIXTURE_NAMESPACE}/asset-${index + 1}`,
        url: `https://res.cloudinary.com/demo/image/upload/v1/sample.jpg?fixture=${index + 1}`,
        altText: `M32 synthetic media ${index + 1}`,
        caption: `Synthetic performance fixture ${index + 1}`,
        width: 1600,
        height: 1000,
        fileSizeBytes: 120000 + index,
        mimeType: 'image/jpeg',
        originalFilename: `m32-asset-${index + 1}.jpg`,
        folder: ['work', 'builds', 'blueprints', 'labs', 'notes', 'team'][index % 6],
        reuseTags: [FIXTURE_NAMESPACE, `shared-${index % 4}`],
      }),
      `media:${index + 1}`,
      { _id: mediaId },
    ),
  );

  const taxonomyIds = dense(Array.from({ length: 20 }, (_, index) => id(`taxonomy:${index + 1}`)));
  const taxonomyKinds = dense([
    ...Array(8).fill('technology'),
    ...Array(6).fill('category'),
    ...Array(6).fill('topic'),
  ] as const);
  const taxonomy = taxonomyIds.map((taxonomyId, index) =>
    withTimestamps(
      taxonomyEntrySchema.parse({
        kind: at(taxonomyKinds, index),
        label: `M32 ${at(taxonomyKinds, index)} ${index + 1}`,
        slug: `m32-${at(taxonomyKinds, index)}-${index + 1}`,
      }),
      `taxonomy:${index + 1}`,
      { _id: taxonomyId },
    ),
  );

  const teamIds = dense(Array.from({ length: 4 }, (_, index) => id(`team:${index + 1}`)));
  const team = teamIds.map((teamId, index) =>
    withTimestamps(
      teamSchema.parse({
        name: `M32 Engineer ${index + 1}`,
        role: index < 2 ? 'Performance Engineer' : 'Product Engineer',
        bio: `Synthetic team biography ${index + 1}.`,
        group: index < 2 ? 'Engineering Team' : 'Operating Team',
        portraitId: at(mediaIds, index).toString(),
        publicProfile: index !== 3,
        founder: false,
        publicCategory: index === 0 ? 'leadership' : 'team',
        engineeringProfileEligible: true,
        joinedAt: FIXED_DATE,
        order: index + 1,
        socialLinks: [],
        archived: false,
      }),
      `team:${index + 1}`,
      { _id: teamId, referenceId: `HZ-TM-${String(index + 1).padStart(3, '0')}` },
    ),
  );

  const workIds = dense(
    Array.from({ length: 8 }, (_, index) =>
      index === 0 ? new ObjectId('64b000000000000000000001') : id(`work:${index + 1}`),
    ),
  );
  const buildIds = dense(Array.from({ length: 4 }, (_, index) => id(`build:${index + 1}`)));
  const blueprintIds = dense(
    Array.from({ length: 12 }, (_, index) => id(`blueprint:${index + 1}`)),
  );
  const labIds = dense(Array.from({ length: 4 }, (_, index) => id(`lab:${index + 1}`)));
  const noteIds = dense(Array.from({ length: 8 }, (_, index) => id(`note:${index + 1}`)));

  const work = workIds.map((workId, index) =>
    withTimestamps(
      convertInputIds(
        workSchema.parse({
          title: index === 0 ? 'M32 Isolation Marker' : `M32 Work ${index + 1}`,
          summary:
            index === 0
              ? 'Synthetic marker proving Preview database isolation.'
              : `Synthetic Work summary ${index + 1}.`,
          slug: index === 0 ? 'm32-isolation-marker' : `m32-work-${index + 1}`,
          status: index === 0 ? 'published' : status(index + 1),
          reviewNote: index === 3 ? 'Synthetic review state.' : null,
          clientType: 'Synthetic validation',
          categoryTagIds: [at(taxonomyIds, 8 + (index % 6)).toString()],
          timeline: `${index + 2} weeks`,
          role: 'Architecture and implementation',
          technologyIds: [
            at(taxonomyIds, index % 8).toString(),
            at(taxonomyIds, (index + 1) % 8).toString(),
          ],
          relatedBuildIds: [],
          relatedBlueprintIds: [],
          relatedLabIds: [],
          contributors: [],
          heroImageId: at(mediaIds, index % 24).toString(),
          repoUrl: `https://example.invalid/m32/work-${index + 1}`,
          featuredOrder: index < 2 ? index + 1 : null,
        }),
      ),
      index === 0 ? 'isolation-marker-unused' : `work:${index + 1}`,
      {
        _id: workId,
        referenceId: index === 0 ? 'HZ-WK-ISO' : `HZ-WK-${String(index + 1).padStart(3, '0')}`,
        createdByUserId: unlinkedAuthorId,
      },
    ),
  );

  const builds = buildIds.map((buildId, index) =>
    withTimestamps(
      buildSchema.parse({
        title: `M32 Build ${index + 1}`,
        summary: `Synthetic Build summary ${index + 1}.`,
        slug: `m32-build-${index + 1}`,
        status: index === 0 ? 'published' : status(index + 1),
        reviewNote: null,
        deploymentState: index === 3 ? 'retired' : 'live',
        liveUrl: `https://example.invalid/m32/build-${index + 1}`,
        repoUrl: `https://example.invalid/m32/build-${index + 1}/repo`,
        technologyIds: [at(taxonomyIds, index % 8).toString()],
        originatingLabId: at(labIds, index).toString(),
        relatedWorkIds: [],
        heroImageId: at(mediaIds, 8 + index).toString(),
        galleryImageIds: [at(mediaIds, 12 + index).toString()],
        featuredOrder: index < 2 ? index + 1 : null,
        contributors: [at(teamIds, index % 4).toString()],
      }),
      `build:${index + 1}`,
      {
        _id: buildId,
        referenceId: `HZ-BL-${String(index + 1).padStart(3, '0')}`,
        createdByUserId: memberId,
      },
    ),
  );

  const blueprints = blueprintIds.map((blueprintId, index) =>
    withTimestamps(
      blueprintSchema.parse({
        name: `Blueprint-Performance-${String(index + 1).padStart(2, '0')}`,
        slug: `m32-blueprint-${index + 1}`,
        status: status(index),
        reviewNote: null,
        architecture: `Synthetic architecture ${index + 1}`,
        designLanguage: `Editorial${index + 1}`,
        shortDescription: `Synthetic Blueprint summary ${index + 1}.`,
        features: ['Deterministic fixture', 'Measured composition'],
        technologyIds: [at(taxonomyIds, index % 8).toString()],
        liveDeploymentUrl: `https://example.invalid/m32/blueprint-${index + 1}`,
        repoUrl: `https://example.invalid/m32/blueprint-${index + 1}/repo`,
        docsUrl: `https://example.invalid/m32/blueprint-${index + 1}/docs`,
        heroImageId: at(mediaIds, index % 24).toString(),
        previewAssetIds: [
          at(mediaIds, (index + 1) % 24).toString(),
          at(mediaIds, (index + 2) % 24).toString(),
        ],
        featuredOrder: index < 2 ? index + 1 : null,
        version: `1.${index}.0`,
        contributors: [at(teamIds, index % 4).toString()],
      }),
      `blueprint:${index + 1}`,
      {
        _id: blueprintId,
        referenceId: `HZ-BP-${String(index + 1).padStart(3, '0')}`,
        createdByUserId: memberId,
      },
    ),
  );

  const labs = labIds.map((labId, index) =>
    withTimestamps(
      labSchema.parse({
        title: `M32 Lab ${index + 1}`,
        slug: `m32-lab-${index + 1}`,
        status: status(index),
        reviewNote: null,
        stage: at(['exploring', 'building', 'testing', 'building'] as const, index),
        objective: `Synthetic research objective ${index + 1}.`,
        researchDirection: `Synthetic research direction ${index + 1}.`,
        currentMilestone: `Validation milestone ${index + 1}.`,
        graduationCriteria: 'Repeatable evidence and stable behavior.',
        ...(index === 0 ? { graduatedToBuildId: at(buildIds, 0).toString() } : {}),
        startDate: FIXED_DATE,
        lastMajorUpdateAt: FIXED_DATE,
        internalRepoUrl: `https://example.invalid/m32/lab-${index + 1}/internal`,
        publicRepoUrl: `https://example.invalid/m32/lab-${index + 1}`,
        liveDemoUrl: `https://example.invalid/m32/lab-${index + 1}/demo`,
        technologyIds: [at(taxonomyIds, index).toString()],
        relatedBuildIds: [at(buildIds, index).toString()],
        relatedBlueprintIds: [at(blueprintIds, index).toString()],
        heroImageId: at(mediaIds, 16 + index).toString(),
        galleryImageIds: [at(mediaIds, 20 + index).toString()],
        featuredOrder: index < 2 ? index + 1 : null,
        milestones: [
          { title: 'Synthetic checkpoint', date: FIXED_DATE, summary: 'Fixture evidence.' },
        ],
        contributors: [at(teamIds, index).toString()],
      }),
      `lab:${index + 1}`,
      {
        _id: labId,
        referenceId: `HZ-LB-${String(index + 1).padStart(3, '0')}`,
        createdByUserId: memberId,
      },
    ),
  );

  const notes = noteIds.map((noteId, index) =>
    withTimestamps(
      noteSchema.parse({
        title: `M32 Note ${index + 1}`,
        slug: `m32-note-${index + 1}`,
        status: index === 0 ? 'published' : status(index + 1),
        reviewNote: null,
        authorId: (index === 0 ? unlinkedAuthorId : memberId).toString(),
        summary: `Synthetic Note summary ${index + 1}.`,
        technologyIds: [at(taxonomyIds, index % 8).toString()],
        relatedEntries: [{ ownerType: 'Build', ownerId: at(buildIds, index % 4).toString() }],
        publicationDate: FIXED_DATE,
        featuredOrder: index < 2 ? index + 1 : null,
        heroImageId: at(mediaIds, index % 24).toString(),
        galleryImageIds: [at(mediaIds, (index + 4) % 24).toString()],
        contributors: [at(teamIds, index % 4).toString()],
      }),
      `note:${index + 1}`,
      {
        _id: noteId,
        referenceId: `HZ-NT-${String(index + 1).padStart(3, '0')}`,
        createdByUserId: memberId,
      },
    ),
  );

  const profiles = teamIds.map((teamId, index) =>
    withTimestamps(
      engineeringProfileSchema.parse({
        slug: `m32-engineer-${index + 1}`,
        status: index < 2 ? 'published' : index === 2 ? 'inReview' : 'draft',
        reviewNote: null,
        teamMemberId: teamId.toString(),
        overview: `Synthetic engineering profile ${index + 1}.`,
        engineeringPhilosophy: 'Measure first and preserve correctness.',
        currentExploration: 'Reliable server-side performance.',
        areasOfExpertise: ['Performance', 'Systems'],
        currentInterests: ['Observability'],
        engineeringIdentity: ['Evidence driven'],
        technologyIds: [at(taxonomyIds, index).toString()],
        featuredWorkIds: [],
        featuredBuildIds: [at(buildIds, index).toString()],
        featuredBlueprintIds: [at(blueprintIds, index).toString()],
        featuredLabIds: [at(labIds, index).toString()],
        featuredNoteIds: [at(noteIds, index).toString()],
        portraitId: at(mediaIds, index).toString(),
        heroMediaId: at(mediaIds, index + 4).toString(),
        galleryImageIds: [at(mediaIds, index + 8).toString()],
      }),
      `profile:${index + 1}`,
      {
        _id: id(`profile:${index + 1}`),
        referenceId: `EP-${String(index + 1).padStart(3, '0')}`,
        createdByUserId: memberId,
      },
    ),
  );

  const careers = Array.from({ length: 2 }, (_, index) =>
    withTimestamps(
      careerSchema.parse({
        title: `M32 Performance Role ${index + 1}`,
        slug: `m32-career-${index + 1}`,
        status: index === 0 ? 'published' : 'draft',
        reviewNote: null,
        location: 'Remote',
        employmentType: 'fullTime',
        experienceLevel: index === 0 ? 'senior' : 'mid',
        summary: `Synthetic career summary ${index + 1}.`,
        responsibilities: ['Measure systems', 'Preserve correctness'],
        requirements: ['Production engineering'],
        benefits: ['Focused engineering environment'],
        compensation: 'Synthetic fixture only',
        applicationProcess: 'Use the isolated validation workflow.',
        technologyIds: [at(taxonomyIds, index).toString()],
        hiringManagerTeamId: at(teamIds, index).toString(),
        relatedEntries: [{ ownerType: 'Build', ownerId: at(buildIds, index).toString() }],
      }),
      `career:${index + 1}`,
      {
        referenceId: `HZ-CR-${String(index + 1).padStart(3, '0')}`,
        createdByUserId: memberId,
      },
    ),
  );

  const services = Array.from({ length: 4 }, (_, index) =>
    withTimestamps(
      serviceSchema.parse({
        title: `M32 Service ${index + 1}`,
        description: `Synthetic service evidence ${index + 1}.`,
        status: index < 2 ? 'published' : 'draft',
        evidenceLinks: [{ ownerType: 'Build', ownerId: at(buildIds, index).toString() }],
        order: index + 1,
        featured: index < 2,
      }),
      `service:${index + 1}`,
    ),
  );

  const leads = Array.from({ length: 5 }, (_, index) =>
    withTimestamps(
      leadSchema.parse({
        name: `M32 Lead ${index + 1}`,
        email: `m32-lead-${index + 1}@hubzero.invalid`,
        message: `Synthetic performance inquiry ${index + 1}.`,
        source: FIXTURE_NAMESPACE,
        status: at(['new', 'contacted', 'closed'] as const, index % 3),
        assignedToUserId: adminId.toString(),
        internalNotes: 'Synthetic fixture only.',
        archived: index === 4,
      }),
      `lead:${index + 1}`,
    ),
  );

  const documentOwners = [
    ...workIds.map((ownerId) => ({
      ownerType: 'Work' as const,
      ownerId,
      role: 'caseStudy' as const,
    })),
    ...buildIds.flatMap((ownerId) => [
      { ownerType: 'Build' as const, ownerId, role: 'caseStudy' as const },
      { ownerType: 'Build' as const, ownerId, role: 'technical' as const },
    ]),
    ...blueprintIds.map((ownerId) => ({
      ownerType: 'Blueprint' as const,
      ownerId,
      role: 'caseStudy' as const,
    })),
    ...labIds.map((ownerId) => ({ ownerType: 'Lab' as const, ownerId, role: 'overview' as const })),
    ...noteIds
      .slice(0, 3)
      .map((ownerId) => ({ ownerType: 'Note' as const, ownerId, role: 'body' as const })),
  ];
  const documents = documentOwners.map((owner, index) => {
    const parsed = documentSchema.parse({
      ownerType: owner.ownerType,
      ownerId: owner.ownerId.toString(),
      role: owner.role,
      blocks: [
        {
          id: `m32-heading-${index + 1}`,
          type: 'heading',
          data: { level: 2, text: `M32 document ${index + 1}` },
        },
        {
          id: `m32-paragraph-${index + 1}`,
          type: 'paragraph',
          data: { text: longText(`Document ${index + 1}`) },
        },
      ],
    });
    return withTimestamps(parsed, `document:${index + 1}`, { ownerId: owner.ownerId });
  });

  const versions = documents.slice(0, 8).map((document, index) => ({
    _id: id(`document-version:${index + 1}`),
    documentId: document._id,
    ownerType: document.ownerType,
    ownerId: document.ownerId,
    role: document.role,
    blocks: document.blocks,
    createdAt: new Date(FIXED_DATE.getTime() + index * 60_000),
    createdByUserId: memberId,
  }));

  const eventTargets = dense([
    ...workIds.map((entityId) => ({ entityType: 'work' as const, entityId })),
    ...buildIds.map((entityId) => ({ entityType: 'build' as const, entityId })),
    ...blueprintIds.map((entityId) => ({ entityType: 'blueprint' as const, entityId })),
    ...labIds.map((entityId) => ({ entityType: 'lab' as const, entityId })),
    ...noteIds.map((entityId) => ({ entityType: 'note' as const, entityId })),
  ]);
  const editorialEvents = Array.from({ length: 40 }, (_, index) => {
    const target = at(eventTargets, index % eventTargets.length);
    const payload =
      index % 4 === 0
        ? {
            type: 'entry.statusChanged' as const,
            from: 'approved' as const,
            to: 'published' as const,
          }
        : index % 4 === 1
          ? { type: 'entry.updated' as const }
          : index % 4 === 2
            ? { type: 'document.updated' as const, role: 'caseStudy' }
            : { type: 'entry.featuredOrderChanged' as const, from: null, to: 1 };
    const parsed = editorialEventSchema.parse({
      entityType: target.entityType,
      entityId: target.entityId.toString(),
      actorUserId: memberId.toString(),
      payload,
    });
    return {
      _id: id(`event:${index + 1}`),
      entityType: parsed.entityType,
      entityId: target.entityId,
      type: parsed.payload.type,
      payload: parsed.payload,
      actorUserId: memberId,
      createdAt: new Date(FIXED_DATE.getTime() + index * 60_000),
    };
  });

  const settings = [
    withTimestamps(
      studioSettingsSchema.parse({
        studioName: 'HubZero M32 Performance Preview',
        tagline: 'Isolated synthetic performance environment',
        contactEmail: '',
        accentColor: '#ffb020',
      }),
      'settings',
      { fixtureNamespace: FIXTURE_NAMESPACE },
    ),
  ];

  return [
    { name: 'users', records: users },
    { name: 'team', records: team },
    { name: 'engineeringProfiles', records: profiles },
    { name: 'work', records: work },
    { name: 'builds', records: builds },
    { name: 'blueprints', records: blueprints },
    { name: 'labs', records: labs },
    { name: 'notes', records: notes },
    { name: 'careers', records: careers },
    { name: 'services', records: services },
    { name: 'leads', records: leads },
    { name: 'documents', records: documents },
    { name: 'documentVersions', records: versions },
    { name: 'media', records: media },
    { name: 'taxonomy', records: taxonomy },
    { name: 'editorialEvents', records: editorialEvents },
    { name: 'settings', records: settings },
  ];
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const memberPassword = process.env.HUBZERO_PERF_MEMBER_PASSWORD;
  const adminPassword = process.env.HUBZERO_PERF_ADMIN_PASSWORD;
  if (!uri) throw new Error('MONGODB_URI is required.');
  if (!memberPassword || !adminPassword)
    throw new Error('Both isolated fixture passwords are required.');
  if (process.env.VERCEL_ENV === 'production') throw new Error('Refusing to seed in Production.');
  if (databaseName(uri) !== ALLOWED_DATABASE) {
    throw new Error(`Refusing to seed any database except ${ALLOWED_DATABASE}.`);
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20_000 });
  await client.connect();
  try {
    const db = client.db();
    if (db.databaseName !== ALLOWED_DATABASE)
      throw new Error('Connected database failed the allow-list check.');
    const plan = await fixtures(memberPassword, adminPassword);
    const counts: Record<string, number> = {};
    for (const fixture of plan) {
      const collection = db.collection(fixture.name);
      for (const record of fixture.records) {
        await collection.replaceOne({ _id: record._id }, record, { upsert: true });
      }
      counts[fixture.name] = await collection.countDocuments({
        _id: { $in: fixture.records.map((record) => record._id) },
      });
    }
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    if (total !== 185) throw new Error(`Expected 185 fixture documents, found ${total}.`);
    process.stdout.write(
      `${JSON.stringify({ database: db.databaseName, total, counts }, null, 2)}\n`,
    );
  } finally {
    await client.close();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Fixture seeding failed.');
  process.exitCode = 1;
});
