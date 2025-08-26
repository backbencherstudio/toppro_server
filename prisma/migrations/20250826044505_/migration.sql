/*
  Warnings:

  - You are about to drop the `DealStage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Label` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeadStage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pipeline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Source` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DealStage" DROP CONSTRAINT "DealStage_pipelineId_fkey";

-- DropForeignKey
ALTER TABLE "Label" DROP CONSTRAINT "Label_pipelineId_fkey";

-- DropForeignKey
ALTER TABLE "LeadStage" DROP CONSTRAINT "LeadStage_pipelineId_fkey";

-- DropForeignKey
ALTER TABLE "Source" DROP CONSTRAINT "Source_pipelineId_fkey";

-- DropTable
DROP TABLE "DealStage";

-- DropTable
DROP TABLE "Label";

-- DropTable
DROP TABLE "LeadStage";

-- DropTable
DROP TABLE "Pipeline";

-- DropTable
DROP TABLE "Source";

-- CreateTable
CREATE TABLE "pipelines" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_stages" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "lead_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_stages" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "deal_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labels" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "pipelineId" TEXT,
    "workspace_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pipelines_workspace_id_owner_id_idx" ON "pipelines"("workspace_id", "owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "pipelines_workspace_id_name_key" ON "pipelines"("workspace_id", "name");

-- CreateIndex
CREATE INDEX "lead_stages_workspace_id_owner_id_idx" ON "lead_stages"("workspace_id", "owner_id");

-- CreateIndex
CREATE INDEX "lead_stages_pipelineId_idx" ON "lead_stages"("pipelineId");

-- CreateIndex
CREATE UNIQUE INDEX "lead_stages_pipelineId_name_key" ON "lead_stages"("pipelineId", "name");

-- CreateIndex
CREATE INDEX "deal_stages_workspace_id_owner_id_idx" ON "deal_stages"("workspace_id", "owner_id");

-- CreateIndex
CREATE INDEX "deal_stages_pipelineId_idx" ON "deal_stages"("pipelineId");

-- CreateIndex
CREATE UNIQUE INDEX "deal_stages_pipelineId_name_key" ON "deal_stages"("pipelineId", "name");

-- CreateIndex
CREATE INDEX "labels_workspace_id_owner_id_idx" ON "labels"("workspace_id", "owner_id");

-- CreateIndex
CREATE INDEX "labels_pipelineId_idx" ON "labels"("pipelineId");

-- CreateIndex
CREATE UNIQUE INDEX "labels_pipelineId_name_key" ON "labels"("pipelineId", "name");

-- CreateIndex
CREATE INDEX "sources_workspace_id_owner_id_idx" ON "sources"("workspace_id", "owner_id");

-- CreateIndex
CREATE INDEX "sources_pipelineId_idx" ON "sources"("pipelineId");

-- CreateIndex
CREATE UNIQUE INDEX "sources_workspace_id_name_key" ON "sources"("workspace_id", "name");

-- AddForeignKey
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_stages" ADD CONSTRAINT "lead_stages_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_stages" ADD CONSTRAINT "lead_stages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_stages" ADD CONSTRAINT "lead_stages_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_stages" ADD CONSTRAINT "deal_stages_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_stages" ADD CONSTRAINT "deal_stages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_stages" ADD CONSTRAINT "deal_stages_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labels" ADD CONSTRAINT "labels_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labels" ADD CONSTRAINT "labels_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labels" ADD CONSTRAINT "labels_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
