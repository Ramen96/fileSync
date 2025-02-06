import { prisma } from "../utils/prisma.server";

export const action = async ({ request }) => {
  try {
    const body  = await request.json();
    const requestType = body.requestType;
    const displayNodeId = body.displayNodeId;
    const requestMethod = await request.method;

    if (requestMethod !== 'POST') {
      return Response.json({ status: 400 });
    }

    if (requestType === 'get_child_nodes') {
      const childNodes = await prisma.hierarchy.findMany({
        where: {
          id: displayNodeId
        }, 
        include: {
          children: {
            include: {
              metadata: true
            }
          }
        }
      });
      return Response.json(childNodes, { status: 200 });
    } else {
      return Response.json({ status: 400 });
    }
  } catch (err) {
    console.error(`error reading request ${err}`);
  }
  return Response.json({ body: "data "}, { status: 200 })
}
