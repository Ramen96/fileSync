import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
  const client = new PrismaClient();
  return client;
};

export const prisma = createPrismaClient();