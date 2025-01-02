-- DropForeignKey
ALTER TABLE "hierarchy" DROP CONSTRAINT "hierarchy_id_fkey";

-- DropForeignKey
ALTER TABLE "hierarchy" DROP CONSTRAINT "hierarchy_parent_id_fkey";

-- AddForeignKey
ALTER TABLE "hierarchy" ADD CONSTRAINT "hierarchy_id_fkey" FOREIGN KEY ("id") REFERENCES "metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hierarchy" ADD CONSTRAINT "hierarchy_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "hierarchy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
