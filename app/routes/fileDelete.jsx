import { json } from "express";
import { prisma } from "../utils/prisma.server"

export const action = async ({ request }) => {
  try {
    const initRoot = await prisma.hierarchy.findFirst({
      where: {
        parent_id: null,
      }
    });

    const rootId = initRoot.id;

    const body = await request.json();
    
    body.forEach(element => {
      console.log(element);
    });

    console.log(`Root id: ${rootId}`);

    return new Response(JSON.stringify({
      message: "200"
    }, {status: 200}));
  } catch (error) {
    console.error(`Error processing request ${error}`);
  }
}