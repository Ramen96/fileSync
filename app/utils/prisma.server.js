// import { PrismaClient } from "@prisma/client";

// let prisma;
// if (process.env.NODE_ENV === 'production') {
//   prisma = new PrismaClient();
//   await prisma.$connect();
// } else {
//   if (!global.__db) {
//     global.__db = new PrismaClient();
//     await global.__db.$connect();
//   }
//   prisma = global.__db;
// }

// export { prisma };

// import { PrismaClient } from "@prisma/client";

// let prisma;

// if (process.env.NODE_ENV === 'production') {
//   prisma = new PrismaClient();
// } else {
//   if (!global.__db) {
//     global.__db = new PrismaClient();
//   }
//   prisma = global.__db;
// }

// export { prisma };


import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
  const client = new PrismaClient();
  return client;
};

export const prisma = createPrismaClient();