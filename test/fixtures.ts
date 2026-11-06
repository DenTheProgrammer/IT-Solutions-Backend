import type {
  Achievement,
  Experience,
  Profile,
  ProfileLink,
  Project,
  Skill,
} from '../src/generated/prisma/client';

export const profileRow = (id: string): Profile => ({
  id,
  slug: id,
  fullName: id,
  headline: 'Test headline',
  summary: 'Test summary',
  location: null,
  workFormat: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
});

export const linkRow = (profileId: string, sortOrder = 0): ProfileLink => ({
  id: `${profileId}-link-${sortOrder}`,
  profileId,
  kind: 'GITHUB',
  label: 'GitHub',
  url: 'https://example.com',
  sortOrder,
});

export const skillRow = (profileId: string, sortOrder = 0): Skill => ({
  id: `${profileId}-skill-${sortOrder}`,
  profileId,
  name: `Skill ${sortOrder}`,
  category: 'DEVELOPMENT',
  details: null,
  sortOrder,
});

export const experienceRow = (
  profileId: string,
  sortOrder = 0,
  overrides: Partial<Experience> = {},
): Experience => ({
  id: `${profileId}-experience-${sortOrder}`,
  profileId,
  company: 'Test company',
  position: 'Developer',
  startDate: new Date('2025-01-01T00:00:00Z'),
  endDate: null,
  summary: null,
  sortOrder,
  ...overrides,
});

export const achievementRow = (
  experienceId: string,
  sortOrder = 0,
): Achievement => ({
  id: `${experienceId}-achievement-${sortOrder}`,
  experienceId,
  text: `Achievement ${sortOrder}`,
  sortOrder,
});

export const projectRow = (profileId: string, sortOrder = 0): Project => ({
  id: `${profileId}-project-${sortOrder}`,
  profileId,
  name: `Project ${sortOrder}`,
  description: null,
  url: null,
  repositoryUrl: null,
  isRepositoryPrivate: false,
  technologies: [],
  sortOrder,
});
