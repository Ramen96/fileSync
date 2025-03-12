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

    const getParentId = async (objectId) => {
      try {
        const elementMetadata = await prisma.metadata.findUnique({
          where: {
            id: objectId
          },
          include: {
            hierarchy: true
          }
        });

        const metadata = {
          parent_id: elementMetadata.hierarchy.parent_id,
          name: elementMetadata.name
        }

        return metadata;
      } catch (error) {
        console.error(`Error getting parentId: ${error}`);
      }
    }

    // returns metadata for the parent folder
    const getMetaData = async (id) => {
      try {
        const metadata = await prisma.hierarchy.findUnique({
          where: {
            id: id
          },
          include: {
            metadata: true
          }
        })

        return metadata.metadata;
      } catch (error) {
        console.error(`Error getting metadata: ${error}`);
      }
    }

    const pathChunks = [];
    const getFilePath = async (metadata) => {
      // Use recursion to get path to root and reconstruct the path
      try {
        const objectId = metadata.id;
        const isFile = metadata.type === "file" ? true : false;
        if (isFile) {
          const fileMetadata = await getParentId(objectId);
          pathChunks.push(fileMetadata.name);
          console.log(`pathChunks: ${pathChunks}`);
          if (fileMetadata.parent_id !== rootId) {
            console.log(await getMetaData(fileMetadata.parent_id));
          } else {
            console.log('in root folder');
          }
        } else {
          console.log('not a file');
          console.log(metadata);
        }
      } catch (error) {
        console.error(`Error constructing file path ${error}`);
        throw new Error(error);
      }
    }
    body.forEach(element => {
      getFilePath(element);
    });

    return new Response(JSON.stringify({
      message: "200"
    }, {status: 200}));
  } catch (error) {
    console.error(`Error processing request ${error}`);
  }
}
