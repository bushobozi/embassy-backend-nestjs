-- AlterTable
ALTER TABLE "embassies" ADD COLUMN     "code" TEXT,
ADD COLUMN     "establishment_date" TIMESTAMP(3),
ADD COLUMN     "facebook_link" TEXT,
ADD COLUMN     "fax_code" TEXT,
ADD COLUMN     "instagram_link" TEXT,
ADD COLUMN     "linkedin_link" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "provides_consular_assistance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "provides_cultural_exchanges" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "provides_passport_services" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "provides_visa_services" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twitter_link" TEXT;
