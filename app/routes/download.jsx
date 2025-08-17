import { prisma } from "../utils/prisma.server";
import * as fs from "node:fs/promises";
import path from "node:path";
import archiver from "archiver";

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

// Helper function to get all children recursively for folder downloads
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
    if (child.metadata.is_folder) {
      const grandChildren = await getAllChildren(child.id);
      allDescendants = [...allDescendants, ...grandChildren];
    }
  }

  return allDescendants;
};

// Helper function to build folder structure path
const buildFolderPath = async (hierarchyId, rootHierarchyId = null) => {
  const pathSegments = [];
  let currentHierarchyId = hierarchyId;

  while (currentHierarchyId && currentHierarchyId !== rootHierarchyId) {
    const hierarchy = await prisma.hierarchy.findUnique({
      where: { id: currentHierarchyId },
      include: { metadata: true }
    });

    if (!hierarchy) break;

    pathSegments.unshift(hierarchy.metadata.name);
    currentHierarchyId = hierarchy.parent_id;
  }

  return pathSegments.join('/');
};

// DOWNLOAD SINGLE FILE (no zip)
export const downloadSingleFile = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const fileId = url.searchParams.get('id');

    if (!fileId) {
      return new Response(JSON.stringify({
        error: 'File ID is required'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get file metadata
    const fileMetadata = await prisma.metadata.findUnique({
      where: { id: fileId },
      include: { hierarchy: true }
    });

    if (!fileMetadata) {
      return new Response(JSON.stringify({
        error: 'File not found'
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (fileMetadata.is_folder) {
      return new Response(JSON.stringify({
        error: 'Cannot download folders as individual files. Use bulk download instead.'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Construct file path using the same pattern as other endpoints
    const uniqueFileName = `${fileId}_${fileMetadata.name}`;
    const filePath = path.join('./cloud/', uniqueFileName);

    // Check if file exists
    const fileExists = await checkIfFileExists(filePath);
    if (!fileExists) {
      return new Response(JSON.stringify({
        error: 'File not found on filesystem'
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Read file content
    const fileBuffer = await fs.readFile(filePath);
    const mimeType = fileMetadata.file_type || 'application/octet-stream';

    console.log(`Individual file downloaded: ${fileMetadata.name}`);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileMetadata.name}"`,
        "Content-Length": fileBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Download single file error:', error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error",
      status: 'failed'
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// BULK DOWNLOAD (with zip for multiple items)
export const downloadBulkFiles = async ({ request }) => {
  try {
    const body = await request.json();
    const { items } = body; // Array of {id} objects

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({
        error: 'Items array is required'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log(`Starting bulk download for ${items.length} items`);

    // Create a ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks = [];

    // Collect archive data
    archive.on('data', (chunk) => chunks.push(chunk));

    const archivePromise = new Promise((resolve, reject) => {
      archive.on('end', () => {
        console.log('Archive created successfully');
        resolve(Buffer.concat(chunks));
      });
      archive.on('error', reject);
    });

    // Process each item
    for (const item of items) {
      try {
        const itemMetadata = await prisma.metadata.findUnique({
          where: { id: item.id },
          include: { hierarchy: true }
        });

        if (!itemMetadata) {
          console.log(`Item not found: ${item.id}`);
          continue;
        }

        if (!itemMetadata.is_folder) {
          // Handle single file
          const uniqueFileName = `${item.id}_${itemMetadata.name}`;
          const filePath = path.join('./cloud/', uniqueFileName);

          const fileExists = await checkIfFileExists(filePath);
          if (fileExists) {
            const fileBuffer = await fs.readFile(filePath);
            archive.append(fileBuffer, { name: itemMetadata.name });
            console.log(`Added file to archive: ${itemMetadata.name}`);
          } else {
            console.log(`File not found on filesystem: ${itemMetadata.name}`);
          }
        } else {
          // Handle folder - get all children recursively
          const allChildren = await getAllChildren(itemMetadata.hierarchy.id);

          // Add folder structure to archive
          for (const child of allChildren) {
            if (!child.metadata.is_folder) {
              const uniqueFileName = `${child.metadata.id}_${child.metadata.name}`;
              const filePath = path.join('./cloud/', uniqueFileName);

              const fileExists = await checkIfFileExists(filePath);
              if (fileExists) {
                const fileBuffer = await fs.readFile(filePath);

                // Build the relative path for the file in the archive
                const relativePath = await buildFolderPath(child.id, itemMetadata.hierarchy.id);
                const archivePath = path.join(itemMetadata.name, relativePath).replace(/\\/g, '/');

                archive.append(fileBuffer, { name: archivePath });
                console.log(`Added file to archive: ${archivePath}`);
              }
            }
          }
        }
      } catch (itemError) {
        console.error(`Error processing item ${item.id}:`, itemError);
      }
    }

    // Finalize archive
    archive.finalize();
    const zipBuffer = await archivePromise;

    // Generate filename for the download
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `download-${timestamp}.zip`;

    console.log(`Bulk download completed: ${filename}`);

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": zipBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Bulk download error:', error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error",
      status: 'failed'
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// MAIN DOWNLOAD ENDPOINT
export const downloadAction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'single';

    if (type === 'single') {
      return await downloadSingleFile({ request });
    } else if (type === 'bulk') {
      return await downloadBulkFiles({ request });
    } else {
      return new Response(JSON.stringify({
        error: 'Invalid download type. Use "single" or "bulk"'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    console.error('Download action error:', error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error",
      status: 'failed'
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const loader = async ({ request }) => {
  return await downloadAction({ request });
};

export const action = downloadAction;