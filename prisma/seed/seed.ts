import 'dotenv/config';
import { createDatabaseAdapter } from '../../src/prisma/adapter';
import { PrismaClient } from '../../src/generated/prisma/client';
import { candidateData } from './candidate.data';

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for seeding');
  }

  const prisma = new PrismaClient({
    adapter: createDatabaseAdapter(connectionString),
  });

  try {
    const profile = await prisma.$transaction(
      async (tx) => {
        const profile = await tx.profile.upsert({
          where: { slug: candidateData.profile.slug },
          create: candidateData.profile,
          update: candidateData.profile,
        });

        await tx.profileLink.deleteMany({ where: { profileId: profile.id } });
        await tx.skill.deleteMany({ where: { profileId: profile.id } });
        // Achievements are removed by the database's cascading foreign key.
        await tx.experience.deleteMany({ where: { profileId: profile.id } });
        await tx.project.deleteMany({ where: { profileId: profile.id } });

        return tx.profile.update({
          where: { id: profile.id },
          data: {
            links: { create: candidateData.links },
            skills: { create: candidateData.skills },
            experiences: {
              create: candidateData.experiences.map(
                ({ achievements, ...experience }) => ({
                  ...experience,
                  achievements: { create: achievements },
                }),
              ),
            },
            projects: { create: candidateData.projects },
          },
        });
      },
      { timeout: 30_000 },
    );

    console.log(`Seed completed: ${profile.slug}`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
