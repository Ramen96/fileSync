import { prisma } from "../utils/prisma.server";
import * as fs from "node:fs/promises";
import path from "node:path";
import WebSocket from "ws";
import { wss } from "../../webSocketServer";

// Helper function to get root node
const getRootNode = async () => {
  const rootNode = await prisma.hierarchy.findFirst({
    where: { parent_id: null },
    include: { metadata: true }
  });
  return rootNode;
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

// Helper function to send WebSocket notification
const sendWebSocketNotification = (parentId) => {
  try {
    if (wss && wss.clients) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              message: "reload",
              id: parentId
            })
          );
        }
      });
    }
  } catch (wsError) {
    console.error('WebSocket error: ', wsError);
  }
};

// CREATE FILE ENDPOINT
export const createFileAction = async ({ request }) => {
  try {
    console.log("Starting file creation process...");

    const body = await request.json();
    const { name, content = '', parentId } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: 'File name is required' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Sanitize filename (remove path traversal attempts and invalid characters)
    const sanitizedName = name.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '');
    if (sanitizedName.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Invalid file name' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get root node for fallback
    const rootNode = await getRootNode();
    if (!rootNode) {
      throw new Error('Root node not found');
    }

    const targetParentId = parentId || rootNode.id;

    // Check if file already exists
    const nameExists = await checkNameExists(sanitizedName, targetParentId);
    if (nameExists) {
      return new Response(JSON.stringify({ 
        error: 'A file or folder with this name already exists' 
      }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Determine file type from extension
    const fileExtension = path.extname(sanitizedName).toLowerCase();
    const fileType = fileExtension || 'text/plain';

    // Create metadata entry
    const fileMetadata = await prisma.metadata.create({
      data: {
        name: sanitizedName,
        is_folder: false,
        created_at: new Date(),
        file_type: fileType,
        hierarchy: {
          create: {
            parent_id: targetParentId
          }
        }
      },
      include: {
        hierarchy: true
      }
    });

    // Ensure cloud directory exists
    await fs.mkdir('cloud', { recursive: true });

    // Generate unique filename to avoid conflicts on filesystem
    const uniqueFileName = `${fileMetadata.id}_${sanitizedName}`;
    const filePath = path.join('cloud', uniqueFileName);

    // Save file to filesystem
    await fs.writeFile(filePath, content, 'utf8');

    console.log(`File created successfully: ${sanitizedName}`);

    // Send WebSocket notification
    sendWebSocketNotification(targetParentId);

    return new Response(JSON.stringify({
      success: true,
      message: "File created successfully",
      file: {
        id: fileMetadata.id,
        name: sanitizedName,
        type: fileType,
        hierarchyId: fileMetadata.hierarchy.id
      }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Create file error:', error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error",
      status: 'failed'
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// CREATE FOLDER ENDPOINT
export const createFolderAction = async ({ request }) => {
  try {
    console.log("Starting folder creation process...");

    const body = await request.json();
    const { name, parentId } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Folder name is required' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Sanitize folder name
    const sanitizedName = name.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '');
    if (sanitizedName.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Invalid folder name' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get root node for fallback
    const rootNode = await getRootNode();
    if (!rootNode) {
      throw new Error('Root node not found');
    }

    const targetParentId = parentId || rootNode.id;

    // Check if folder already exists
    const nameExists = await checkNameExists(sanitizedName, targetParentId);
    if (nameExists) {
      return new Response(JSON.stringify({ 
        error: 'A file or folder with this name already exists' 
      }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Create folder metadata entry
    const folderMetadata = await prisma.metadata.create({
      data: {
        name: sanitizedName,
        is_folder: true,
        created_at: new Date(),
        hierarchy: {
          create: {
            parent_id: targetParentId
          }
        }
      },
      include: {
        hierarchy: true
      }
    });

    console.log(`Folder created successfully: ${sanitizedName}`);

    // Send WebSocket notification
    sendWebSocketNotification(targetParentId);

    return new Response(JSON.stringify({
      success: true,
      message: "Folder created successfully",
      folder: {
        id: folderMetadata.id,
        name: sanitizedName,
        hierarchyId: folderMetadata.hierarchy.id,
        isFolder: true
      }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Create folder error:', error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error",
      status: 'failed'
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// COMBINED ENDPOINT (if you prefer one endpoint that handles both)
export const createAction = async ({ request }) => {
  try {
    const body = await request.json();
    const { type, name, content, parentId } = body;

    if (type === 'file') {
      // Create a new request object for the file creation
      const fileRequest = new Request(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify({ name, content, parentId })
      });
      return await createFileAction({ request: fileRequest });
    } else if (type === 'folder') {
      // Create a new request object for the folder creation
      const folderRequest = new Request(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify({ name, parentId })
      });
      return await createFolderAction({ request: folderRequest });
    } else {
      return new Response(JSON.stringify({ 
        error: 'Invalid type. Must be "file" or "folder"' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    console.error('Create action error:', error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error",
      status: 'failed'
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const action = createAction;