-- CreateTable
CREATE TABLE "metadata" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(50),
    "is_folder" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hierarchy" (
    "id" UUID NOT NULL,
    "parent_id" UUID,

    CONSTRAINT "hierarchy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "hierarchy" ADD CONSTRAINT "hierarchy_id_fkey" FOREIGN KEY ("id") REFERENCES "metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hierarchy" ADD CONSTRAINT "hierarchy_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "hierarchy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
