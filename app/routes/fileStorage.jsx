import { Dir, mkdir } from "node:fs";
import { prisma } from "../utils/prisma.server";
import * as fs from "node:fs/promises";
// import path, { join } from "node:path";
import path from "node:path";
import { get } from "node:https";

const joinPath = (arr) => path.join(...arr);

export const action = async ({ request }) => {
  try {
    const parseRequest = await request.formData();
    const formData = Object.fromEntries(parseRequest);
    const metadata = JSON.parse(formData.metadata);

    const pathTraversalDetection = (path) => {
      const traversalPatterns = [
        "../", "%2e%2e%2f", "%2e%2e/", "..%2f", "%2e%2e%5c",
        "%2e%2e'", "..%5c", "%252e%252e%255c", "..%255c",
        "..", " / ", "..%c0%af", "..%c1%9c",
      ];
      return traversalPatterns.some(pattern => path.includes(pattern));
    };

    // Check paths for traversal attempts
    for (const item of metadata) {
      if (pathTraversalDetection(item.webkitRelativePath)) {
        console.error('Path traversal detection flagged: ', item.webkitRelativePath);
        return new Response(JSON.stringify({ error: 'Invalid path' }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const queryWebkitRelitivePathChunck = async (parentID, currentArrElementName) => {
      const result = await prisma.metadata.findMany({
        where: {
          name: currentArrElementName,
          hierarchy: {
            is: {
              parent_id: parentID
            }
          }
        },
        include: {
          hierarchy: true
        }
      });
      return result;
    };

    const pathExists = async (path) => {
      try {
        await fs.access(path);
        return true;
      } catch (err) {
        if (err.code === "ENOENT") return false;
        throw err;
      }
    };

    const saveFile = async (path, name, fileType, isFolder) => {
      // Rethinking how to do this.
      // 1 check the file path.
      // 2 if file path exisists
      // -- throw an error saying the file already exists
      // 3 if file path dose not exist
      // -- split the path creating an array
      // -- loop through the array for each element in it check if the path exists joining the previous elements to reconstruct the path
      //    if you reach a point where the paths no longer match what is on the file system
      //    create a new array that only contains the parts that do not currently exist in the file system
      // 
      // 4 In the db look up the name of the last folder in the path that currently exists
      // -- create new coloum in metadata table for relitve paths
      // -- query db for matching relitve path to ge id for the parrent folder
      //    -- once the id has been obtained use it as the parent id for the first folder in the array
      //       and using each previous array element as the parent id for the current one 
      //        -- make sure only the last element in the array is saved as a file in the db

      if (typeof isFolder !== "boolean") {
        console.error('Error: isFolder param is not a boolean value');
        return new Response(JSON.stringify({ error: "isFolder param is not a boolean value" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (isFolder) {
        try {
          const checkingPath = await pathExists(path);
          if (checkingPath) throw Error("File path already exists");
        } catch (e) {
          console.error(`Error checking path: ${e}`);
        }

        let splitPath = path.split('/');
        let pathToBeChecked = './cloud';
        const existingPathArr = ['./cloud'];
        try {
          for (let i = 0; splitPath.length > i; i++) {
            let currentParentId = null;

            try {
              // RENAME STUFF HERE: was just testing to see if it would work it dose so now rename it.
              const x = await queryWebkitRelitivePathChunck(currentParentId, splitPath[i]);
              for (let e in x) {
                console.log(x[e]);
              }
            } catch (err) {
              if (err) console.log(`Error caught file/folder dose not exist in db ${err}`);
            }
            
            
            // pathToBeChecked = pathToBeChecked + '/' + splitPath[i];
          }
        } catch (err) {
          console.error(`Error checking path: ${err}`);
        }

        const existingPath = joinPath(existingPathArr);
        console.log(`pathToBeChecked: ${pathToBeChecked}, splitPath: ${splitPath}, existingPath: ${existingPath}`);

      } else {
        // for now if it is a file just save to root
        // later on the front end grab the parent id of the folder the user is in and send it in the request to this route
        console.log(name);
      }

      // try {
      //   if (isFolder) {
      //     const splitPath = path.split('/');
      //     splitPath.pop();
      //     splitPath.splice(0, 1);
          // for (const currentFolderName of splitPath) {
          //   const existingFolder = await prisma.metadata.findFirst({
          //     where: { name: currentFolderName }
          //   });
          //   const root = './cloud';

          //   if (!existingFolder) {
          //     await prisma.metadata.create({
          //       data: {
          //         name: currentFolderName,
          //         is_folder: true,
          //         created_at: new Date(),
          //         hierarchy: {
          //           create: {
          //             parent_id: await getRootUUID()
          //           }
          //         }
          //       }
          //     });

          //   } else {
          //     const hierarchy = await prisma.hierarchy.findFirst({
          //       where: { id: existingFolder.id }
          //     });

          //     if (!hierarchy?.parent_id) {
          //       await prisma.metadata.create({
          //         data: {
          //           name: currentFolderName,
          //           is_folder: true,
          //           hierarchy: {
          //             create: {
          //               parent_id: await getRootUUID()
          //             }
          //           }
          //         }
          //       });
          //     }
          //   }
          // }
          
      //   } else {
      //     const exists = await pathExists(path);
      //     if (!exists) {
      //       await fs.mkdir(path.dirname(path), { recursive: true });
      //       await fs.writeFile(path, Buffer.from(content));
      //       await prisma.metadata.create({
      //         data: {
      //           name,
      //           file_type: fileType,
      //           is_folder: false,
      //           created_at: new Date()
      //         }
      //       });
      //     }
      //   }
      // } catch (error) {
      //   console.error(`Error saving ${isFolder ? 'folder' : 'file'}: ${error}`);
      //   throw error;
      // }
    };

    for (const item of metadata) {
      const { parent_id, webkitRelativePath, name, type, is_folder } = item;

      if (!parent_id) {
        await saveFile(webkitRelativePath, name, type, is_folder);
      } else {
        const parentFolder = await prisma.metadata.findUnique({
          where: { id: parent_id }
        });
        if (!parentFolder) throw new Error(`Parent folder ${parent_id} not found`);
        // TODO: Implement parent folder relative path logic
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Action error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
