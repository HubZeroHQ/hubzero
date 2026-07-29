import { afterEach, describe, expect, it, vi } from 'vitest';
import packageJson from '../../../package.json';
import { getSystemInfo } from './system-info';

describe('getSystemInfo', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('reports administrator-facing production deployment information', () => {
    vi.stubEnv('MONGODB_URI', 'mongodb://localhost:27017/hubzero-test');
    vi.stubEnv('AUTH_SECRET', 'test-secret');
    vi.stubEnv('CLOUDINARY_CLOUD_NAME', 'hubzero');
    vi.stubEnv('CLOUDINARY_API_KEY', 'key');
    vi.stubEnv('CLOUDINARY_API_SECRET', 'secret');
    const info = getSystemInfo();

    expect(info.deploymentStage).toBe('Production');
    expect(info.version).toBe(packageJson.version);
    expect(info).not.toHaveProperty('nodeEnv');
    expect(info).not.toHaveProperty('commitSha');
  });
});
