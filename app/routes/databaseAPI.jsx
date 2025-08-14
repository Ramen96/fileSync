import { prisma } from "../utils/prisma.server";

export const action = async ({ request }) => {
  try {
    const body = await request.json();
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
    }
    else if (requestType === 'search_files') {
      const searchQuery = body.searchQuery;

      if (!searchQuery || typeof searchQuery !== 'string') {
        return Response.json([], { status: 200 });
      }

      const searchResults = await prisma.hierarchy.findMany({
        where: {
          metadata: {
            name: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          }
        },
        include: {
          metadata: true,
          parent: {
            include: {
              metadata: true
            }
          }
        },
        take: 10
      });
      return Response.json(searchResults, { status: 200 });

    } else if (requestType === 'get_parent_node') {
      const nodeId = body.nodeId;
      if (!nodeId) {
        return Response.json({ error: 'nodeId is required' }, { status: 400 });
      }

      const node = await prisma.hierarchy.findUnique({
        where: {
          id: nodeId
        },
        include: {
          parent: {
            include: {
              metadata: true
            }
          }
        }
      });

      if (!node || !node.parent) {
        return Response.json({ parentNode: null }, { status: 200 });
      }
      return Response.json({ parentNode: node.parent }, { status: 200 });
    }
    else {
      return Response.json({ status: 400 });
    }
  } catch (err) {
    console.error(`error reading request ${err}`);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}