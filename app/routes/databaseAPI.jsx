import { prisma } from "../utils/prisma.server";

export const action = async ({ request }) => {
  console.log(request);
}