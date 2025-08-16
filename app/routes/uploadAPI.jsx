// import { prisma } from "../utils/prisma.server";
// import * as fs from "node:fs/promises";
// import path from "node:path";
// import WebSocket from "ws";
// import { wss } from "../../webSocketServer";

// const joinPath = (arr) => path.join(...arr);

// export const action = async ({ request }) => {
//   try {
//     console.log("Starting file upload process...");

//     // Parse the form data
//     const formData = await request.formData();
//     console.log("FormData parsed successfully");

//     // Get metadata
//     const metadataString = formData.get('metadata');
//     if (!metadataString) {
//       throw new Error('No metadata provided');
//     }

//     const metadata = JSON.parse(metadataString);
//     console.log("Metadata parsed:", metadata);

//     const wsReturnedParentId = metadata[0]?.parent_id;
//     console.log("Parent ID:", wsReturnedParentId);

//     // Path traversal detection
//     const pathTraversalDetection = (activePath) => {
//       const traversalPatterns = [
//         "../", "%2e%2e%2f", "%2e%2e/", "..%2f", "%2e%2e%5c",
//         "%2e%2e'", "..%5c", "%252e%252e%255c", "..%255c",
//         "..", " / ", "..%c0%af", "..%c1%9c",
//       ];
//       return traversalPatterns.some(pattern => activePath.includes(pattern));
//     };

//     // Check paths for traversal attempts
//     for (const item of metadata) {
//       if (item.webkitRelativePath && pathTraversalDetection(item.webkitRelativePath)) {
//         console.error('Path traversal detection flagged: ', item.webkitRelativePath);
//         return new Response(JSON.stringify({ error: 'Invalid path' }), {
//           status: 400,
//           headers: { "Content-Type": "application/json" },
//         });
//       }
//     }

//     // Helper function to get root node
//     const getRootNode = async () => {
//       const rootNode = await prisma.hierarchy.findFirst({
//         where: { parent_id: null },
//         include: { metadata: true }
//       });
//       return rootNode;
//     };

//     // Helper function to find node by name and parent
//     const findNodeByNameAndParent = async (name, parentId) => {
//       try {
//         const result = await prisma.metadata.findFirst({
//           where: {
//             name: name,
//             hierarchy: {
//               parent_id: parentId
//             }
//           },
//           include: {
//             hierarchy: true
//           }
//         });
//         return result;
//       } catch (error) {
//         console.error('Error finding node:', error);
//         return null;
//       }
//     };

//     // Helper function to create directory structure
//     const createDirectoryStructure = async (filePath, parentId) => {
//       const pathSegments = filePath.split('/').filter(segment => segment.length > 0);
//       let currentParentId = parentId;

//       // Create each directory in the path
//       for (let i = 0; i < pathSegments.length - 1; i++) {
//         const segmentName = pathSegments[i];

//         // Check if directory already exists
//         let existingNode = await findNodeByNameAndParent(segmentName, currentParentId);

//         if (!existingNode) {
//           // Create new directory node
//           const newDirectory = await prisma.metadata.create({
//             data: {
//               name: segmentName,
//               is_folder: true,
//               created_at: new Date(),
//               hierarchy: {
//                 create: {
//                   parent_id: currentParentId
//                 }
//               }
//             },
//             include: {
//               hierarchy: true
//             }
//           });
//           currentParentId = newDirectory.hierarchy.id;
//         } else {
//           currentParentId = existingNode.hierarchy.id;
//         }
//       }

//       return currentParentId;
//     };

//     // Helper function to save file
//     const saveFile = async (fileName, fileType, parentId, fileBuffer) => {
//       try {
//         // Create metadata entry
//         const fileMetadata = await prisma.metadata.create({
//           data: {
//             name: fileName,
//             is_folder: false,
//             created_at: new Date(),
//             file_type: fileType,
//             hierarchy: {
//               create: {
//                 parent_id: parentId
//               }
//             }
//           }
//         });

//         // Ensure cloud directory exists
//         await fs.mkdir('cloud', { recursive: true });

//         // Save file to filesystem
//         const filePath = path.join('cloud', fileName);
//         await fs.writeFile(filePath, fileBuffer);

//         console.log(`File saved successfully: ${filePath}`);
//         return fileMetadata;
//       } catch (error) {
//         console.error(`Error saving file ${fileName}:`, error);
//         throw error;
//       }
//     };

//     // Get root node for fallback
//     const rootNode = await getRootNode();
//     if (!rootNode) {
//       throw new Error('Root node not found');
//     }

//     // Process each file
//     for (const item of metadata) {
//       const { parent_id, webkitRelativePath, name, type, is_folder } = item;

//       // Use provided parent_id or fallback to root
//       let targetParentId = parent_id || rootNode.id;

//       // Get the actual file from FormData
//       const file = formData.get(name);
//       if (!file || !(file instanceof File)) {
//         console.error(`File not found in FormData: ${name}`);
//         continue;
//       }

//       const fileBuffer = Buffer.from(await file.arrayBuffer());

//       if (is_folder && webkitRelativePath) {
//         // Handle folder upload - create directory structure
//         const finalParentId = await createDirectoryStructure(webkitRelativePath, targetParentId);
//         await saveFile(name, type, finalParentId, fileBuffer);
//       } else {
//         // Handle single file upload
//         await saveFile(name, type, targetParentId, fileBuffer);
//       }
//     }

//     // Send WebSocket notification
//     try {
//       if (wss && wss.clients) {
//         wss.clients.forEach((client) => {
//           if (client.readyState === WebSocket.OPEN) {
//             client.send(
//               JSON.stringify({
//                 message: "reload",
//                 id: wsReturnedParentId || rootNode.id
//               })
//             );
//           }
//         });
//       }
//     } catch (wsError) {
//       console.error('WebSocket error: ', wsError);
//     }

//     console.log("File upload completed successfully");
//     return new Response(JSON.stringify({
//       success: true,
//       message: "Files uploaded successfully"
//     }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" }
//     });

//   } catch (error) {
//     console.error('Action error:', error);
//     return new Response(JSON.stringify({
//       error: error.message || "Internal server error",
//       status: 'failed'
//     }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" }
//     });
//   }
// };



import { prisma } from "../utils/prisma.server";
import * as fs from "node:fs/promises";
import path from "node:path";
import WebSocket from "ws";
import { wss } from "../../webSocketServer";

const joinPath = (arr) => path.join(...arr);

export const action = async ({ request }) => {
  try {
    console.log("Starting file upload process...");

    // Parse the form data
    const formData = await request.formData();
    console.log("FormData parsed successfully");

    // Get metadata
    const metadataString = formData.get('metadata');
    if (!metadataString) {
      throw new Error('No metadata provided');
    }

    const metadata = JSON.parse(metadataString);
    console.log("Metadata parsed:", metadata);

    const wsReturnedParentId = metadata[0]?.parent_id;
    console.log("Parent ID:", wsReturnedParentId);

    // Path traversal detection
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
      if (item.webkitRelativePath && pathTraversalDetection(item.webkitRelativePath)) {
        console.error('Path traversal detection flagged: ', item.webkitRelativePath);
        return new Response(JSON.stringify({ error: 'Invalid path' }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Helper function to get root node
    const getRootNode = async () => {
      const rootNode = await prisma.hierarchy.findFirst({
        where: { parent_id: null },
        include: { metadata: true }
      });
      return rootNode;
    };

    // Helper function to find node by name and parent
    const findNodeByNameAndParent = async (name, parentId) => {
      try {
        const result = await prisma.metadata.findFirst({
          where: {
            name: name,
            hierarchy: {
              parent_id: parentId
            }
          },
          include: {
            hierarchy: true
          }
        });
        return result;
      } catch (error) {
        console.error('Error finding node:', error);
        return null;
      }
    };

    // Helper function to check if name already exists in parent
    const checkNameExists = async (name, parentId) => {
      const existing = await prisma.metadata.findFirst({
        where: {
          name: name,
          hierarchy: {
            parent_id: parentId
          }
        }
      });
      return existing !== null;
    };

    // Helper function to create directory structure
    const createDirectoryStructure = async (filePath, parentId) => {
      const pathSegments = filePath.split('/').filter(segment => segment.length > 0);
      let currentParentId = parentId;

      // Create each directory in the path
      for (let i = 0; i < pathSegments.length - 1; i++) {
        const segmentName = pathSegments[i];

        // Check if directory already exists
        let existingNode = await findNodeByNameAndParent(segmentName, currentParentId);

        if (!existingNode) {
          // Create new directory node
          const newDirectory = await prisma.metadata.create({
            data: {
              name: segmentName,
              is_folder: true,
              created_at: new Date(),
              hierarchy: {
                create: {
                  parent_id: currentParentId
                }
              }
            },
            include: {
              hierarchy: true
            }
          });
          currentParentId = newDirectory.hierarchy.id;
        } else {
          currentParentId = existingNode.hierarchy.id;
        }
      }

      return currentParentId;
    };

    // Helper function to save file
    const saveFile = async (fileName, fileType, parentId, fileBuffer) => {
      try {
        // Create metadata entry
        const fileMetadata = await prisma.metadata.create({
          data: {
            name: fileName,
            is_folder: false,
            created_at: new Date(),
            file_type: fileType,
            hierarchy: {
              create: {
                parent_id: parentId
              }
            }
          }
        });

        // Ensure cloud directory exists
        await fs.mkdir('cloud', { recursive: true });

        // Generate unique filename using UUID pattern like createNew endpoint
        const uniqueFileName = `${fileMetadata.id}_${fileName}`;
        const filePath = path.join('cloud', uniqueFileName);
        await fs.writeFile(filePath, fileBuffer);

        console.log(`File saved successfully: ${filePath}`);
        return fileMetadata;
      } catch (error) {
        console.error(`Error saving file ${fileName}:`, error);
        throw error;
      }
    };

    // Get root node for fallback
    const rootNode = await getRootNode();
    if (!rootNode) {
      throw new Error('Root node not found');
    }

    // Check for duplicates before processing any files
    const duplicates = [];
    for (const item of metadata) {
      const { parent_id, name } = item;
      const targetParentId = parent_id || rootNode.id;

      // Check if file/folder name already exists in the target directory
      if (await checkNameExists(name, targetParentId)) {
        duplicates.push(name);
      }
    }

    // If duplicates found, return error response
    if (duplicates.length > 0) {
      const errorMessage = duplicates.length === 1 
        ? `A file or folder with the name "${duplicates[0]}" already exists in this directory`
        : `Files or folders with these names already exist in this directory: ${duplicates.join(', ')}`;
      
      return new Response(JSON.stringify({
        error: errorMessage,
        duplicates: duplicates,
        status: 'duplicate_names'
      }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Process each file (no duplicates found)
    for (const item of metadata) {
      const { parent_id, webkitRelativePath, name, type, is_folder } = item;

      // Use provided parent_id or fallback to root
      let targetParentId = parent_id || rootNode.id;

      // Get the actual file from FormData
      const file = formData.get(name);
      if (!file || !(file instanceof File)) {
        console.error(`File not found in FormData: ${name}`);
        continue;
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());

      if (is_folder && webkitRelativePath) {
        // Handle folder upload - create directory structure
        const finalParentId = await createDirectoryStructure(webkitRelativePath, targetParentId);
        await saveFile(name, type, finalParentId, fileBuffer);
      } else {
        // Handle single file upload
        await saveFile(name, type, targetParentId, fileBuffer);
      }
    }

    // Send WebSocket notification
    try {
      if (wss && wss.clients) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                message: "reload",
                id: wsReturnedParentId || rootNode.id
              })
            );
          }
        });
      }
    } catch (wsError) {
      console.error('WebSocket error: ', wsError);
    }

    console.log("File upload completed successfully");
    return new Response(JSON.stringify({
      success: true,
      message: "Files uploaded successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Action error:', error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error",
      status: 'failed'
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};