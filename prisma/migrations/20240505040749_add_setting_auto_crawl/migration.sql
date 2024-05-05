-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('DAYS', 'WEEK', 'MONTH');

-- CreateTable
CREATE TABLE "SettingCrawl" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "period_type" "PeriodType" NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "time" TEXT NOT NULL,

    CONSTRAINT "pk_setting_crawl" PRIMARY KEY ("id")
);
