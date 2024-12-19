import { prisma } from "../utils/prisma.server";
import * as fs from "node:fs/promises";
import path from "node:path";

export const action = async ({ request }) => {
  const parseRequest = await request.formData();
  const formData = Object.fromEntries(parseRequest);
  const metadata = JSON.parse(formData.metadata);

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

  // checking paths
  for (let i = 0; i < metadata.length; i++) {
    const path = metadata[i].webkitRelativePath;
    if (pathTraversalDetection(path) === true) {
      console.error('Path traversal detection flagged: ', path);
      return new Response(JSON.stringify({}), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }

  // 1. check parent_id to get parent folder default to root if null
  // 2. 

  // figure out where to save the file
  const root = "./cloud";
  for (let i = 0; i < metadata.length; i++) {
    let savePath;
    const parentId = metadata[i].parent_id;
    const relitivePath = metadata[i].webkitRelativePath;

    if (parentId === null) {
      savePath = path.join(root, relitivePath);
    } else {
      const parentFolder = await prisma.metadata.findMany({
        where: {
          id: parentId
        }
      });

      // need to get relitive path of parent folder
    }
    console.log(savePath);
  }


  // const formData = await request.formData();
  // const formDataObject = Object.fromEntries(formData);
  // const webKitRelitivePath = [];

  // for (let file in formDataObject) {
  //   if (formDataObject[file] instanceof File) {
  //     const relitivePath = formDataObject[file].name;
  //     webKitRelitivePath.push(relitivePath);
  //   } else {
  //     throw new Error("Error: Not a file");
  //   }
  // }

  // const itteratePaths = () => {
  //   let pathSafe = false;
  //   for (let i = 0; i < webKitRelitivePath.length; i++) {
  //     const path = webKitRelitivePath[i];
  //     if (pathTraversalDetection(path)) {
  //       pathSafe = false;
  //       throw new Error("Warning: path traversal is true.");
  //     } else {
  //       pathSafe = true;
  //     }
  //   }
  //   return pathSafe;
  // };

  // if (itteratePaths()) {
  //   for (let file in formDataObject) {
  //     if (formDataObject[file] instanceof File) {
  //       const content = await formDataObject[file].arrayBuffer();
  //       const fileRelitvePath = formDataObject[file].name;
  //       const fileName = formDataObject[file].name.slice(fileRelitvePath.lastIndexOf("/") + 1, fileRelitvePath.length);
  //       const filePath = path.join("./cloud", fileRelitvePath);
  //       const fileType = formDataObject[file].type;

  //       const pathExists = async () => {
  //         try {
  //           await fs.access(filePath);
  //           return false;
  //         } catch (err) {
  //           if (err.code === "ENOENT") {
  //             return true;
  //           } else {
  //             throw err;
  //           }
  //         }
  //       };

  //       const writeToDb = async () => {
  //         await prisma.file_data.create({
  //           data: {
  //             relitive_path: fileRelitvePath,
  //             file_name: fileName,
  //             file_type: fileType,
  //             save_date: new Date()
  //           }
  //         })
  //       }

  //       pathExists()
  //         .then(async (inValidPath) => {
  //           if (inValidPath) {
  //             console.log("path dose not exist");
  //             console.log("writing files");
  //             try {
  //               await fs.mkdir(path.dirname(filePath), { recursive: true });
  //               await fs.writeFile(filePath, Buffer.from(content));
  //               await writeToDb();
  //             } catch (err) {
  //               console.log(err);
  //               throw new Error(`Failed to write file ${fileRelitvePath}`);
  //             }
  //           } else {
  //             console.log("file already exists");
  //           }
  //         })
  //         .catch((err) => {
  //           console.error("error checking directory", err);
  //         });
  //     } else {
  //       throw new Error("Error: Not a file");
  //     }
  //   }
  // }

  const placehodler = {};
  return new Response(JSON.stringify(placehodler), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
