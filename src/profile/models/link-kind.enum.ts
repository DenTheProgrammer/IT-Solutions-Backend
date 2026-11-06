import { registerEnumType } from '@nestjs/graphql';

export const LinkKind = {
  GITHUB: 'GITHUB',
  TELEGRAM: 'TELEGRAM',
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  PROFI_RU: 'PROFI_RU',
  YOUTUBE: 'YOUTUBE',
  BEHANCE: 'BEHANCE',
  WEBSITE: 'WEBSITE',
  OTHER: 'OTHER',
} as const;

export type LinkKind = (typeof LinkKind)[keyof typeof LinkKind];
registerEnumType(LinkKind, { name: 'LinkKind' });
