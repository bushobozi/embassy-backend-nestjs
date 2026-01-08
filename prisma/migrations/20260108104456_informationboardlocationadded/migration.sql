/*
  Warnings:

  - Added the required column `location` to the `information_boards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "information_boards" ADD COLUMN     "location" TEXT NOT NULL;
