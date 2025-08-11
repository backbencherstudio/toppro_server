/*
  Warnings:

  - You are about to drop the column `content` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `cover_image` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `is_published` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the `BlogTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_blocks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_log` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlogTag" DROP CONSTRAINT "BlogTag_blog_id_fkey";

-- DropForeignKey
ALTER TABLE "BlogTag" DROP CONSTRAINT "BlogTag_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "blog_blocks" DROP CONSTRAINT "blog_blocks_blog_id_fkey";

-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "content",
DROP COLUMN "cover_image",
DROP COLUMN "is_published",
ADD COLUMN     "hashtags" TEXT[],
ADD COLUMN     "status" SMALLINT DEFAULT 1,
ALTER COLUMN "title" DROP NOT NULL;

-- DropTable
DROP TABLE "BlogTag";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "blog_blocks";

-- DropTable
DROP TABLE "chat_log";

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "status" SMALLINT DEFAULT 1,
    "schedule_at" TIMESTAMP(3),
    "content" TEXT,
    "hashtags" TEXT[],

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_channels" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "status" SMALLINT DEFAULT 1,
    "post_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,

    CONSTRAINT "post_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_files" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "status" SMALLINT DEFAULT 1,
    "sort_order" INTEGER DEFAULT 0,
    "post_id" TEXT,
    "name" TEXT,
    "type" TEXT,
    "size" INTEGER,
    "file_path" TEXT,
    "file_alt" TEXT,

    CONSTRAINT "post_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_contents" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "status" SMALLINT DEFAULT 1,
    "content_type" TEXT,
    "content" TEXT,

    CONSTRAINT "blog_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "status" SMALLINT DEFAULT 1,
    "name" TEXT,
    "slug" TEXT,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_blog_categories" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blog_id" TEXT NOT NULL,
    "blog_category_id" TEXT NOT NULL,

    CONSTRAINT "blog_blog_categories_pkey" PRIMARY KEY ("blog_id","blog_category_id")
);

-- CreateTable
CREATE TABLE "blog_files" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "status" SMALLINT DEFAULT 1,
    "sort_order" INTEGER DEFAULT 0,
    "blog_content_id" TEXT,
    "name" TEXT,
    "type" TEXT,
    "size" INTEGER,
    "file_path" TEXT,
    "file_alt" TEXT,

    CONSTRAINT "blog_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- AddForeignKey
ALTER TABLE "post_channels" ADD CONSTRAINT "post_channels_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_channels" ADD CONSTRAINT "post_channels_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_files" ADD CONSTRAINT "post_files_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_blog_categories" ADD CONSTRAINT "blog_blog_categories_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_blog_categories" ADD CONSTRAINT "blog_blog_categories_blog_category_id_fkey" FOREIGN KEY ("blog_category_id") REFERENCES "blog_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_files" ADD CONSTRAINT "blog_files_blog_content_id_fkey" FOREIGN KEY ("blog_content_id") REFERENCES "blog_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
