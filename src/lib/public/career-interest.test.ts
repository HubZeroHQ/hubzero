import { describe, expect, it } from 'vitest';
import { publicCareerInterestSchema } from './career-interest';

describe('public Career interest boundary', () => {
  it('validates the two required fields (name, email) and introduction', () => {
    expect(
      publicCareerInterestSchema.safeParse({
        name: 'Ari',
        email: 'ari@example.com',
        resumeUrl: '',
        portfolioUrl: '',
        githubUrl: '',
        linkedinUrl: '',
        areasOfInterest: '',
        introduction: 'What I work on and why HubZero.',
      }).success,
    ).toBe(true);

    expect(
      publicCareerInterestSchema.safeParse({
        name: '',
        email: 'not-an-email',
        resumeUrl: '',
        portfolioUrl: '',
        githubUrl: '',
        linkedinUrl: '',
        areasOfInterest: '',
        introduction: '',
      }).success,
    ).toBe(false);
  });

  it('treats empty optional URL fields as absent rather than invalid', () => {
    const result = publicCareerInterestSchema.safeParse({
      name: 'Ari',
      email: 'ari@example.com',
      resumeUrl: '',
      portfolioUrl: '',
      githubUrl: '',
      linkedinUrl: '',
      areasOfInterest: '',
      introduction: 'Intro.',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.resumeUrl).toBeUndefined();
      expect(result.data.portfolioUrl).toBeUndefined();
    }
  });

  it('rejects a provided URL field that is not a real http(s) link', () => {
    const result = publicCareerInterestSchema.safeParse({
      name: 'Ari',
      email: 'ari@example.com',
      resumeUrl: 'not-a-url',
      portfolioUrl: '',
      githubUrl: '',
      linkedinUrl: '',
      areasOfInterest: '',
      introduction: 'Intro.',
    });
    expect(result.success).toBe(false);
  });

  it('splits comma-separated areas of interest into a trimmed array', () => {
    const result = publicCareerInterestSchema.safeParse({
      name: 'Ari',
      email: 'ari@example.com',
      resumeUrl: '',
      portfolioUrl: '',
      githubUrl: '',
      linkedinUrl: '',
      areasOfInterest: 'backend systems,  AI infrastructure ,developer tools',
      introduction: 'Intro.',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.areasOfInterest).toEqual([
        'backend systems',
        'AI infrastructure',
        'developer tools',
      ]);
    }
  });

  it('lowercases email the same way publicContactSchema does', () => {
    const result = publicCareerInterestSchema.safeParse({
      name: 'Ari',
      email: 'Ari@Example.com',
      resumeUrl: '',
      portfolioUrl: '',
      githubUrl: '',
      linkedinUrl: '',
      areasOfInterest: '',
      introduction: 'Intro.',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('ari@example.com');
    }
  });
});
