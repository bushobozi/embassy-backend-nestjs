/*
  Warnings:

  - Added the required column `embassy_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First, ensure there's at least one embassy to use as default
-- Create a default embassy if none exists
INSERT INTO embassies (id, name, country, city, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Default Embassy',
  'Default Country',
  'Default City',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM embassies LIMIT 1);

-- Add the column with a temporary default using the first embassy
ALTER TABLE "users" ADD COLUMN "embassy_id" TEXT;

-- Set embassy_id for existing users to the first available embassy
UPDATE "users" 
SET "embassy_id" = (SELECT id FROM embassies ORDER BY created_at ASC LIMIT 1)
WHERE "embassy_id" IS NULL;

-- Now make it NOT NULL
ALTER TABLE "users" ALTER COLUMN "embassy_id" SET NOT NULL;

-- Add the foreign key constraint
ALTER TABLE "users" ADD CONSTRAINT "users_embassy_id_fkey" FOREIGN KEY ("embassy_id") REFERENCES "embassies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
