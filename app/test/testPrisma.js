import { prisma } from '../utils/prisma.server.js';

async function testPrisma() {
  try {
    const files = await prisma.file_data.findMany();
    console.log('Files:', files);
  } catch (error) {
    console.error('Error fetching files:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
