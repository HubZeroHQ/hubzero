import { z } from 'zod';

export interface CareerInterestValues {
  name: string;
  email: string;
  resumeUrl: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  areasOfInterest: string;
  introduction: string;
}

export interface CareerInterestActionState {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Partial<Record<keyof CareerInterestValues, string>>;
  values: CareerInterestValues;
}

export const INITIAL_CAREER_INTEREST_STATE: CareerInterestActionState = {
  status: 'idle',
  values: {
    name: '',
    email: '',
    resumeUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    areasOfInterest: '',
    introduction: '',
  },
};

function optionalUrlField(label: string) {
  return z
    .string()
    .trim()
    .max(500, `Keep the ${label} link under 500 characters.`)
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => value === undefined || /^https?:\/\//i.test(value), {
      message: `Enter a valid ${label} link, starting with http:// or https://`,
    });
}

export const publicCareerInterestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your name.')
    .max(100, 'Keep your name under 100 characters.'),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address.')
    .max(254, 'Keep your email under 254 characters.')
    .transform((value) => value.toLowerCase()),
  resumeUrl: optionalUrlField('resume'),
  portfolioUrl: optionalUrlField('portfolio'),
  githubUrl: optionalUrlField('GitHub'),
  linkedinUrl: optionalUrlField('LinkedIn'),
  areasOfInterest: z
    .string()
    .trim()
    .max(300, 'Keep areas of interest under 300 characters.')
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean)
        : [],
    ),
  introduction: z
    .string()
    .trim()
    .min(1, 'Tell us a little about yourself and what you’re looking for.')
    .max(3_000, 'Keep your introduction under 3,000 characters.'),
});

export function careerInterestValuesFromFormData(formData: FormData): CareerInterestValues {
  return {
    name: boundedString(formData.get('name'), 100),
    email: boundedString(formData.get('email'), 254),
    resumeUrl: boundedString(formData.get('resumeUrl'), 500),
    portfolioUrl: boundedString(formData.get('portfolioUrl'), 500),
    githubUrl: boundedString(formData.get('githubUrl'), 500),
    linkedinUrl: boundedString(formData.get('linkedinUrl'), 500),
    areasOfInterest: boundedString(formData.get('areasOfInterest'), 300),
    introduction: boundedString(formData.get('introduction'), 3_000),
  };
}

function boundedString(value: FormDataEntryValue | null, maximum: number): string {
  return typeof value === 'string' ? value.slice(0, maximum) : '';
}
