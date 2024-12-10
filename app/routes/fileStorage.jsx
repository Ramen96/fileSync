import { prisma } from "../utils/prisma.server";
import * as fs from "node:fs/promises";
import path from "node:path";

export const action = async ({ request }) => {
  const pathTraversalDetection = (path) => {
    const traversalPatterns = [
      "../",
      "%2e%2e%2f",
      "%2e%2e/",
      "..%2f",
      "%2e%2e%5c",
      "%2e%2e'",
      "..%5c",
      "%252e%252e%255c",
      "..%255c",
      "..",
      " / ",
      "..%c0%af",
      "..%c1%9c",
    ];

    let traversalDetection = undefined;

    for (let i = 0; i < traversalPatterns.length; i++) {
      let traversalState = path.includes(traversalPatterns[i]);
      if (traversalState === true) {
        traversalDetection = true;
        break;
      } else {
        traversalDetection = false;
      }
    }
    return traversalDetection;
  };

  const formData = await request.formData();
  const formDataObject = Object.fromEntries(formData);
  const webKitRelitivePath = [];

  for (let file in formDataObject) {
    if (formDataObject[file] instanceof File) {
      const relitivePath = formDataObject[file].name;
      webKitRelitivePath.push(relitivePath);
    } else {
      throw new Error("Error: Not a file");
    }
  }

  const itteratePaths = () => {
    let pathSafe = false;
    for (let i = 0; i < webKitRelitivePath.length; i++) {
      const path = webKitRelitivePath[i];
      if (pathTraversalDetection(path)) {
        pathSafe = false;
        throw new Error("Warning: path traversal is true.");
      } else {
        pathSafe = true;
      }
    }
    return pathSafe;
  };

  if (itteratePaths()) {
    for (let file in formDataObject) {
      if (formDataObject[file] instanceof File) {
        const content = await formDataObject[file].arrayBuffer();
        const fileRelitvePath = formDataObject[file].name;
        const fileName = formDataObject[file].name.slice(fileRelitvePath.lastIndexOf("/") + 1, fileRelitvePath.length);
        const filePath = path.join("./cloud", fileRelitvePath);
        const fileType = formDataObject[file].type;

        const pathExists = async () => {
          try {
            await fs.access(filePath);
            return false;
          } catch (err) {
            if (err.code === "ENOENT") {
              return true;
            } else {
              throw err;
            }
          }
        };

        // Changing here to write to new db tables

        const writeToDb = async () => {
          await prisma.file_data.create({
            data: {
              relitive_path: fileRelitvePath,
              file_name: fileName,
              file_type: fileType,
              save_date: new Date()
            }
          })

          await prisma.metadata.create({
            id: id,
            name: fileName,
            file_type: fileType,
            is_folder: is_folder,
            created_at: new Date()
          })

          await prisma.hierarchy.create({
            id: id,
            // Figure out how to get parrent id to get parrent id...
            // Step 1)  before passing to this action route get the id of the directory the user is currently in
            //          and pass it as a param to this fucntion.
            // step 2) if parrent id is the root parrent id is null
            parent_id: parent_id
          })
        }

        pathExists()
          .then(async (inValidPath) => {
            if (inValidPath) {
              console.log("path dose not exist");
              console.log("writing files");
              try {
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, Buffer.from(content));
                await writeToDb();
              } catch (err) {
                console.log(err);
                throw new Error(`Failed to write file ${fileRelitvePath}`);
              }
            } else {
              console.log("file already exists");
            }
          })
          .catch((err) => {
            console.error("error checking directory", err);
          });
      } else {
        throw new Error("Error: Not a file");
      }
    }
  }

  const placehodler = {};
  return new Response(JSON.stringify(placehodler), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
