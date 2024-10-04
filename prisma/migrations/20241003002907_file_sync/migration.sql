-- CreateTable
CREATE TABLE "file_data" (
    "relitive_path" TEXT,
    "file_name" VARCHAR(255),
    "file_type" VARCHAR(255),
    "save_date" DATE,
    "id" SERIAL NOT NULL,

    CONSTRAINT "file_data_pkey" PRIMARY KEY ("id")
);
