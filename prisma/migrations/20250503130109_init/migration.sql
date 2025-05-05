/*
  Warnings:

  - Added the required column `purpose` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "purpose" TEXT NOT NULL;
