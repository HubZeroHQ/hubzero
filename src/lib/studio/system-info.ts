import packageJson from '../../../package.json';
import { serverEnv } from '@/lib/env';

/**
 * Settings → System's read-only panel (Settings completion sprint, Part 8)
 * — build/version and integration-status information, derived directly from
 * existing config rather than a persisted model. Booleans only for
 * integration status: presence of a credential, never the credential
 * itself.
 */
export interface SystemInfo {
  version: string;
  deploymentStage: 'Production';
  cloudinaryConfigured: boolean;
  geminiConfigured: boolean;
}

export function getSystemInfo(): SystemInfo {
  const env = serverEnv();
  return {
    version: packageJson.version,
    deploymentStage: 'Production',
    cloudinaryConfigured: Boolean(
      env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
    ),
    geminiConfigured: Boolean(env.GEMINI_API_KEY),
  };
}
