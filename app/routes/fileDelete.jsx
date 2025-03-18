import { prisma } from "../utils/prisma.server"
import * as fs from "node:fs/promises";

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

    let pathChunks = [];
    let filePath;
    const getFilePath = async (metadata) => {
      // Use recursion to get path to root and reconstruct the path
      try {
        const objectId = metadata.id;
        const fileMetadata = await getParentId(objectId);

        pathChunks.push(fileMetadata.name);

        if (fileMetadata.parent_id !== rootId) {
          await getFilePath(await getMetaData(fileMetadata.parent_id));
        } else {
          filePath = 'cloud/' + pathChunks.reverse().join("/");
          pathChunks = [];
        }
        return filePath;

      } catch (error) {
        console.error(`Error constructing file path ${error}`);
        throw new Error(error);
      }
    }

    body.forEach(async (element) => {
      const elementID = element.id;
      try {
        // Todo: use file path to delete from system
        //      -- bug note:  when selecting multiple files to delete the path printed is not the full path
        //                    it is the path to the parent folder of both items
        const filePath = await getFilePath(element);

        const checkIfPathExists = async (activePath) => {
          try {
            await fs.access(activePath);
            return true;
          } catch (err) {
            if (err.code === "ENOENT") return false;
            throw err;
          }
        };

        const file = await checkIfPathExists(filePath); // returns boolean letting you know if file exists

        const deleteFile = (filePath) => {
          fs.rm(filePath, { recursive: false }, (err) => {
            if (err) {
              console.error(err.message); 
              return;
            }
            console.log(`File deleted successfully: ${filePath}`)
          })
        }

        if (file) {
          console.log('Deleting file from system...');
          deleteFile(filePath);

          try {
            await prisma.metadata.delete({
              where : {
                id: elementID
              }
            });
            console.log('file deleted from database');
          } catch (err) {
            console.error(`Error deleting file: ${filePath} from database ${err}`);
          }

        } else {
          console.log('file dose not exist');
        }

        console.log(`filePath: ${filePath}`);
      } catch (err) {
        console.log(`Something went wrong in body.foreach, Error: ${err}`);
      }
    });

    return new Response(JSON.stringify({
      message: "200"
    }, {status: 200}));
  } catch (error) {
    console.error(`Error processing request ${error}`);
  }
}
