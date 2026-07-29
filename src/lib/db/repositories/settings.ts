import { ObjectId, type UpdateFilter } from 'mongodb';
import { studioSettingsSchema, type StudioSettingsInput } from '@/lib/validation/settings';
import type { StudioSettings } from '@/types/studio';
import { collections } from '../collections';
import { parsePartialInput } from '../repository';

/** Studio → Settings → System has never been configured yet — the same defaults `docs/architecture/PLANNING.md` uses for the product name elsewhere. */
const DEFAULTS: StudioSettingsInput = {
  studioName: 'HubZero',
  tagline: '',
  contactEmail: '',
};

/**
 * The Studio's one singleton collection — exactly one document ever exists.
 * No other repository needs this shape (every other collection is a real
 * list), so it's hand-rolled here rather than routed through
 * `createRepository()`, which assumes many documents and a reference-ID/
 * timestamp `create()` per call.
 *
 * `get()` is a pure read — it must never write, even when unconfigured.
 * `next build` executes every Server Component's data fetch once (to
 * detect static vs. dynamic rendering), including this page's, so a
 * write-on-read here would mean *running the build* silently inserts a
 * document into whatever database `MONGODB_URI` points at. The singleton
 * is only ever actually created by `update()`, which only runs from Head
 * Admin's Settings form submit — a deliberate action, not a side effect of
 * a build or a page view.
 */
export const settingsRepository = {
  async get(): Promise<StudioSettings> {
    const collection = await collections.settings();
    const existing = await collection.findOne({});
    if (existing) {
      return existing;
    }

    const now = new Date();
    return {
      _id: new ObjectId(),
      ...studioSettingsSchema.parse(DEFAULTS),
      createdAt: now,
      updatedAt: now,
    } as unknown as StudioSettings;
  },

  async update(input: Partial<StudioSettingsInput>): Promise<StudioSettings> {
    const patch = parsePartialInput(studioSettingsSchema, input);
    const collection = await collections.settings();
    const existing = await collection.findOne({});

    if (existing) {
      const result = await collection.findOneAndUpdate(
        { _id: existing._id },
        { $set: { ...patch, updatedAt: new Date() } } as UpdateFilter<StudioSettings>,
        { returnDocument: 'after' },
      );
      return (result ?? existing) as StudioSettings;
    }

    const now = new Date();
    const doc = {
      ...studioSettingsSchema.parse(DEFAULTS),
      ...patch,
      createdAt: now,
      updatedAt: now,
    };
    const { insertedId } = await collection.insertOne(doc as StudioSettings);
    return { ...doc, _id: insertedId } as StudioSettings;
  },
};
