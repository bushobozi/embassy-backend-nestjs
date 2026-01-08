-- CreateTable
CREATE TABLE "information_boards" (
    "id" TEXT NOT NULL,
    "embassy_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "image" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "information_boards_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "information_boards" ADD CONSTRAINT "information_boards_embassy_id_fkey" FOREIGN KEY ("embassy_id") REFERENCES "embassies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
