import { prisma } from "../utils/prisma.server"
import { wss } from "../../webSocketServer";
import WebSocket from "ws";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export const action = async ({ request }) => {
  try {
    const body = await request.json();
    const deleteQueue = body?.deleteQueue;
    const displayNodeId = body?.displayNodeId;

    if (!deleteQueue || !Array.isArray(deleteQueue)) {
      return new Response(JSON.stringify({
        error: "Invalid deleteQueue provided"
      }), { status: 400 });
    }

    // Helper function to check if file exists
    const checkIfFileExists = async (filePath) => {
      try {
        await fs.access(filePath);
        return true;
      } catch (err) {
        if (err.code === "ENOENT") return false;
        throw err;
      }
    };

    // Helper function to delete file from filesystem
    const deleteFile = async (filePath) => {
      try {
        await fs.rm(filePath, { recursive: false });
        console.log(`File deleted successfully: ${filePath}`);
        return true;
      } catch (err) {
        console.error(`Error deleting file ${filePath}:`, err.message);
        return false;
      }
    };

    // Helper function to recursively get all children of a folder
    const getAllChildren = async (parentId) => {
      const children = await prisma.hierarchy.findMany({
        where: {
          parent_id: parentId
        },
        include: {
          metadata: true
        }
      });

      let allDescendants = [...children];

      // Recursively get children of each child
      for (const child of children) {
        const grandChildren = await getAllChildren(child.id);
        allDescendants = [...allDescendants, ...grandChildren];
      }

      return allDescendants;
    };

    // Helper function to delete folder and all its contents
    const deleteFolder = async (folderId) => {
      try {
        // Get all children recursively
        const allChildren = await getAllChildren(folderId);
        
        // Delete all child files from filesystem first
        for (const child of allChildren) {
          if (!child.metadata.is_folder) {
            const uniqueFileName = `${child.metadata.id}_${child.metadata.name}`;
            const filePath = path.join('./cloud/', uniqueFileName);
            const fileExists = await checkIfFileExists(filePath);
            
            if (fileExists) {
              await deleteFile(filePath);
            }
          }
        }

        // Delete all children from database (metadata entries)
        const childMetadataIds = allChildren.map(child => child.metadata.id);
        if (childMetadataIds.length > 0) {
          await prisma.metadata.deleteMany({
            where: {
              id: {
                in: childMetadataIds
              }
            }
          });
        }

        // Finally delete the folder itself from database
        await prisma.metadata.delete({
          where: {
            id: folderId
          }
        });

        console.log(`Folder and all contents deleted successfully`);
        return true;
      } catch (error) {
        console.error(`Error deleting folder:`, error);
        return false;
      }
    };

    // Process each item in deleteQueue
    const results = [];
    
    for (const element of deleteQueue) {
      try {
        const elementId = element.id;
        
        // Get the metadata for this element
        const elementMetadata = await prisma.metadata.findUnique({
          where: {
            id: elementId
          }
        });

        if (!elementMetadata) {
          console.log(`Element with id ${elementId} not found in database`);
          results.push({ id: elementId, success: false, reason: 'Not found' });
          continue;
        }

        // Check if it's a file or folder
        if (!elementMetadata.is_folder) {
          // Handle file deletion - use the UUID_filename pattern
          const uniqueFileName = `${elementId}_${elementMetadata.name}`;
          const filePath = path.join('./cloud/', uniqueFileName);
          const fileExists = await checkIfFileExists(filePath);

          if (fileExists) {
            const fileDeleted = await deleteFile(filePath);
            
            if (fileDeleted) {
              // Delete from database
              await prisma.metadata.delete({
                where: {
                  id: elementId
                }
              });
              console.log(`File deleted from database: ${elementId}`);
              results.push({ id: elementId, success: true, type: 'file' });
            } else {
              results.push({ id: elementId, success: false, reason: 'Failed to delete file' });
            }
          } else {
            // File doesn't exist on filesystem, just remove from database
            await prisma.metadata.delete({
              where: {
                id: elementId
              }
            });
            console.log(`File not found on filesystem, removed from database: ${elementId}`);
            results.push({ id: elementId, success: true, type: 'file', note: 'File not found on filesystem' });
          }
        } else if (elementMetadata.is_folder) {
          // Handle folder deletion
          const folderDeleted = await deleteFolder(elementId);
          results.push({ 
            id: elementId, 
            success: folderDeleted, 
            type: 'folder',
            reason: folderDeleted ? null : 'Failed to delete folder'
          });
        } else {
          console.log(`Unknown element type for: ${elementMetadata.name}`);
          results.push({ id: elementId, success: false, reason: 'Unknown type' });
        }

      } catch (err) {
        console.error(`Error processing element ${element.id}:`, err);
        results.push({ id: element.id, success: false, reason: err.message });
      }
    }

    // Send WebSocket notification
    try {
      const socket = wss;
      socket.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              message: "reload",
              id: displayNodeId,
              deletedItems: results.filter(r => r.success).map(r => r.id)
            })
          );
        }
      });
    } catch (wsError) {
      console.error('WebSocket error:', wsError);
    }

    return new Response(JSON.stringify({
      message: "Delete operation completed",
      results: results,
      totalProcessed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }), { status: 200 });

  } catch (error) {
    console.error(`Error processing delete request:`, error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), { status: 500 });
  }
}