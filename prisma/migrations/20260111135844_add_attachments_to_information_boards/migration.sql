-- AlterTable
ALTER TABLE "information_boards" ADD COLUMN     "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[];
