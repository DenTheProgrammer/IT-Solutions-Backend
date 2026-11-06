-- CreateEnum
CREATE TYPE "link_kind" AS ENUM ('GITHUB', 'TELEGRAM', 'EMAIL', 'PHONE', 'PROFI_RU', 'YOUTUBE', 'BEHANCE', 'WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "skill_category" AS ENUM ('DEVELOPMENT', 'INTEGRATIONS_OPERATIONS', 'QUALITY_AUTOMATION');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "location" TEXT,
    "work_format" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_links" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "kind" "link_kind" NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "profile_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "skill_category" NOT NULL,
    "details" TEXT,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "summary" TEXT,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" UUID NOT NULL,
    "experience_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "repository_url" TEXT,
    "is_repository_private" BOOLEAN NOT NULL DEFAULT false,
    "technologies" TEXT[],
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_slug_key" ON "profiles"("slug");

-- CreateIndex
CREATE INDEX "profile_links_profile_id_idx" ON "profile_links"("profile_id");

-- CreateIndex
CREATE INDEX "skills_profile_id_category_idx" ON "skills"("profile_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "skills_profile_id_name_key" ON "skills"("profile_id", "name");

-- CreateIndex
CREATE INDEX "experiences_profile_id_idx" ON "experiences"("profile_id");

-- CreateIndex
CREATE INDEX "achievements_experience_id_idx" ON "achievements"("experience_id");

-- CreateIndex
CREATE INDEX "projects_profile_id_idx" ON "projects"("profile_id");

-- AddForeignKey
ALTER TABLE "profile_links" ADD CONSTRAINT "profile_links_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
