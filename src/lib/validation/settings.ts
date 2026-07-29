import { z } from 'zod';
import { objectIdString } from './shared';

/**
 * Studio → Settings → System's editable section. Deliberately minimal —
 * only the fields that are genuinely runtime-editable today. Environment,
 * build, and integration-status information is read-only and derived
 * directly from existing config (`src/config/*`, `serverEnv()`), never
 * stored here — see the System settings page for that split.
 */
export const studioSettingsSchema = z.object({
  studioName: z.string().min(1),
  tagline: z.string().default(''),
  // Empty string is a valid, honest "not configured yet" state for the
  // singleton's very first (auto-created) document — `settingsRepository
  // .get()` seeds one before Head Admin has ever visited this page, so the
  // schema itself must tolerate that rather than only accepting a real
  // email once someone has filled the form in.
  contactEmail: z.union([z.literal(''), z.string().email()]).default(''),
  logoMediaId: objectIdString.optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a 6-digit hex color, e.g. #ffb020')
    .optional(),
});

export type StudioSettingsInput = z.infer<typeof studioSettingsSchema>;
