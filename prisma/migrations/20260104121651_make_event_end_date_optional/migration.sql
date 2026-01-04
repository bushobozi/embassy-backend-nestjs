/*
  Warnings:

  - You are about to drop the column `description` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `event_date` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `events` table. All the data in the column will be lost.
  - Added the required column `event_name` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_start_date` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "description",
DROP COLUMN "event_date",
DROP COLUMN "location",
DROP COLUMN "title",
ADD COLUMN     "event_cost" DOUBLE PRECISION,
ADD COLUMN     "event_description" TEXT,
ADD COLUMN     "event_end_date" TIMESTAMP(3),
ADD COLUMN     "event_image" TEXT,
ADD COLUMN     "event_location" TEXT,
ADD COLUMN     "event_name" TEXT NOT NULL,
ADD COLUMN     "event_start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_private" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_attendees" INTEGER,
ADD COLUMN     "registration_deadline" TIMESTAMP(3);
