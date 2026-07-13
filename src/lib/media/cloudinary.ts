import { v2 as cloudinary } from 'cloudinary';
import { serverEnv } from '@/lib/env';

let configured = false;

/**
 * Configures the SDK on first use rather than at import time, consistent
 * with the lazy pattern in `lib/db/mongodb.ts` — importing this module
 * should never have a side effect.
 */
function ensureConfigured(): typeof cloudinary {
  if (!configured) {
    const env = serverEnv();
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

export interface SignedUploadParams {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
}

/**
 * Cloudinary is the sole media storage provider (§26.10, §33) — the Studio
 * never stores image files locally or in the database. Uploads happen
 * directly from the browser to Cloudinary using a short-lived signature
 * generated server-side, so the API secret never reaches the client.
 */
export function createSignedUploadParams(folder = 'hubzero'): SignedUploadParams {
  const client = ensureConfigured();
  const env = serverEnv();
  const timestamp = Math.round(Date.now() / 1000);

  const signature = client.utils.api_sign_request({ timestamp, folder }, env.CLOUDINARY_API_SECRET);

  return {
    timestamp,
    signature,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
  };
}

export function getCloudinaryClient(): typeof cloudinary {
  return ensureConfigured();
}
