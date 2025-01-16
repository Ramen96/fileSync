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

    const pathTraversalDetection = (activePath) => {
      const traversalPatterns = [
        "../", "%2e%2e%2f", "%2e%2e/", "..%2f", "%2e%2e%5c",
        "%2e%2e'", "..%5c", "%252e%252e%255c", "..%255c",
        "..", " / ", "..%c0%af", "..%c1%9c",
      ];
      return traversalPatterns.some(pattern => activePath.includes(pattern));
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

    const queryWebkitRelativePathChunk = async (parentID, currentArrElementName) => {
      if (currentArrElementName === './cloud') currentArrElementName = 'Root';
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

    const checkIfPathExists = async (activePath) => {
      try {
        await fs.access(activePath);
        return true;
      } catch (err) {
        if (err.code === "ENOENT") return false;
        throw err;
      }
    };

    const saveFile = async (activePath, name, fileType, isFolder) => {

      const writeChunkToDB = async (currentChunk, chunkIsFolder, parentId) => {
        if (chunkIsFolder) {
          const query = await prisma.metadata.create({
            data: {
              name: currentChunk,
              is_folder: true,
              created_at: new Date(),
              hierarchy: {
                create: {
                  parent_id: parentId
                }
              }
            }
          });
          return query;
        } else {
          const query = await prisma.metadata.create({
            data: {
              name: currentChunk,
              is_folder: false,
              created_at: new Date(),
              file_type: fileType,
              hierarchy: {
                create: {
                  parent_id: parentId
                }
              }
            }
          })
          return query;
        }
      }

      if (typeof isFolder !== "boolean") {
        console.error('Error: isFolder param is not a boolean value');
        return new Response(JSON.stringify({ error: "isFolder param is not a boolean value" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      try {
        const checkingPath = await checkIfPathExists(activePath);
        if (checkingPath) throw Error("File path already exists");
      } catch (e) {
        console.error(`Error checking path: ${e}`);
      }
      
      let splitPath = activePath.split('/');
      splitPath.unshift('Root');
      try {
        let currentParentId = null;
        for (let i = 0; splitPath.length > i; i++) {
          let reconstructedPathArr = [];
          const currentChunkName = splitPath[i];

          try {
            const chunkQuery = await queryWebkitRelativePathChunk(currentParentId, currentChunkName);

            async function handleWriteChunkToDB(chunkIsFolder) {
              try {
                const res = await writeChunkToDB(currentChunkName, chunkIsFolder, currentParentId);
                currentParentId = res.id; 
              } catch (err) {
                console.error(`Error writing chunk to DB: ${err}`);
                throw err;
              }
            }

            if (JSON.stringify(chunkQuery) === JSON.stringify([])) {
              const currentChunkIsFolder = splitPath.length - 1 !== i;
              await handleWriteChunkToDB(currentChunkIsFolder);
            } else {
              currentParentId = chunkQuery[0].hierarchy.id;
            }

            } catch (err) {
              if (err) console.log(`Error caught file/folder dose not exist in db ${err}`);
            }
            splitPath.forEach(e => reconstructedPathArr.push(e));
            reconstructedPathArr.shift();
            const reconstructedPath = joinPath(reconstructedPathArr);
            try {
              const pathExists = await checkIfPathExists(reconstructedPath);
              if (!pathExists) {
                for (let i in formData) {
                  if (formData[i] instanceof File) {
                    if (formData[i].name === reconstructedPath) {
                      try {
                        const fileBuffer = Buffer.from(await formData[i].arrayBuffer());
                        await fs.mkdir(path.dirname('cloud/' + reconstructedPath), { recursive: true });
                        await fs.writeFile('cloud/' + reconstructedPath, fileBuffer);
                      } catch (err) {
                        console.error(`Error writing file: ${err}`);
                      }
                    }
                  }
                }
              }
            } catch (err) {
              if (err)
              console.error(`Error checking if path exists ${err}`);
            }
          }
        } catch (err) {
          console.error(`Error checking path: ${err}`);
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
