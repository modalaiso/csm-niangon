/*
  Warnings:

  - You are about to drop the column `editedAt` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `hiddenBy` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `isHidden` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PushSubscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "PushSubscription" DROP CONSTRAINT "PushSubscription_userId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "editedAt",
DROP COLUMN "hiddenBy",
DROP COLUMN "isHidden";

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "type";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "PushSubscription";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "PostReactionType";
