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

// Helper function to get MIME type from file extension
const getMimeType = (extension) => {
  const mimeTypes = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.html': 'text/html',
    '.css': 'text/css',
    '.py': 'text/x-python',
    '.xml': 'application/xml',
    '.csv': 'text/csv'
  };
  return mimeTypes[extension.toLowerCase()] || 'text/plain';
};

// Helper function to ensure proper file extension
const ensureFileExtension = (fileName, fileType) => {
  const currentExtension = path.extname(fileName).toLowerCase();
  const expectedExtension = `.${fileType}`;
  
  // If the file already has the correct extension, return as is
  if (currentExtension === expectedExtension) {
    return fileName;
  }
  
  // If the file has a different extension, replace it
  if (currentExtension) {
    const nameWithoutExt = path.basename(fileName, currentExtension);
    return `${nameWithoutExt}${expectedExtension}`;
  }
  
  // If no extension, add the correct one
  return `${fileName}${expectedExtension}`;
};

// CREATE FILE ENDPOINT
export const createFileAction = async ({ request }) => {
  try {
    console.log("Starting file creation process...");

    const body = await request.json();
    const { name, content = '', fileType = 'txt', parentId } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: 'File name is required' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!fileType || fileType.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: 'File type is required' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Sanitize filename (remove path traversal attempts and invalid characters)
    const sanitizedBaseName = name.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '');
    if (sanitizedBaseName.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Invalid file name' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Ensure the filename has the correct extension based on selected file type
    const finalFileName = ensureFileExtension(sanitizedBaseName, fileType.trim());
    
    // Get the MIME type based on the file extension
    const fileExtension = `.${fileType.trim()}`;
    const mimeType = getMimeType(fileExtension);

    console.log(`Creating file: ${finalFileName} with type: ${fileType} (${mimeType})`);

    // Get root node for fallback
    const rootNode = await getRootNode();
    if (!rootNode) {
      throw new Error('Root node not found');
    }

    const targetParentId = parentId || rootNode.id;

    // Check if file already exists (using the final filename with extension)
    const nameExists = await checkNameExists(finalFileName, targetParentId);
    if (nameExists) {
      return new Response(JSON.stringify({ 
        error: 'A file or folder with this name already exists' 
      }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Create metadata entry
    const fileMetadata = await prisma.metadata.create({
      data: {
        name: finalFileName,
        is_folder: false,
        created_at: new Date(),
        file_type: mimeType,
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
    const uniqueFileName = `${fileMetadata.id}_${finalFileName}`;
    const filePath = path.join('cloud', uniqueFileName);

    // Save file to filesystem with the content
    await fs.writeFile(filePath, content || '', 'utf8');

    console.log(`File created successfully: ${finalFileName} at ${filePath}`);

    // Send WebSocket notification
    sendWebSocketNotification(targetParentId);

    return new Response(JSON.stringify({
      success: true,
      message: "File created successfully",
      file: {
        id: fileMetadata.id,
        name: finalFileName,
        type: mimeType,
        fileType: fileType,
        hierarchyId: fileMetadata.hierarchy.id,
        path: filePath
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
    const { type, name, content, fileType, parentId } = body;

    if (type === 'file') {
      // Create a new request object for the file creation
      const fileRequest = new Request(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify({ name, content, fileType, parentId })
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