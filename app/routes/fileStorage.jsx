import { 
  json, 
  unstable_parseMultipartFormData, 
  unstable_createMemoryUploadHandler, 
  unstable_composeUploadHandlers, 
  unstable_createFileUploadHandler 
} from "@remix-run/node";
import { formatPostcssSourceMap } from "vite";

export const action = async ({ request }) => {
  const pathTraversalDetection = (path) => {
    const traversalPatterns = [
        "../",
        "%2e%2e%2f",
        "%2e%2e/",
        "..%2f",
        "%2e%2e%5c",
        "%2e%2e\'",
        "..%5c",
        "%252e%252e%255c",
        "..%255c",
        "..",
        " / ",
        "..%c0%af",
        "..%c1%9c"
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
  }


  const formData = await request.formData();
  const formDataObject = Object.fromEntries(formData);
  const relitivePaths = [...Object.entries(JSON.parse(formDataObject.relitivePaths))];

  function loopObject(obj) {
    for (let file in obj) {
      if (obj[file] instanceof File) {
        console.log(obj[file].name);
      }
    }
  }


  const itteratePaths = () => {
    let pathSafe = false;
    for (let i = 0; i < relitivePaths.length; i++) {
      const webKitRelitivePath = relitivePaths[i][1]; 
      const fileName = relitivePaths[i][0];
      
      if (pathTraversalDetection(webKitRelitivePath)) {
        pathSafe = false;
        throw new Error("Warning: path traversal is true.");
      } else {
        pathSafe = true;
        // console.log(`cloud/${webKitRelitivePath}/${fileName}`);
      }
    }
    return pathSafe;
  }

  if (itteratePaths()) {
    loopObject(formDataObject);
  }
  
  // const parseFormDataObj = await request.formData();
  // const formData = unstable_composeUploadHandlers(
  //   unstable_createMemoryUploadHandler()
  // )
  
  // const test = await unstable_parseMultipartFormData(
  //   request,
  //   formData
  // )

  // console.log("relitivePaths: ", webKitRelitivePathsArr);
  // console.log(parseFormDataObj)

  // let triggerWriteData = false;
  
  
  
  // const webKitRelitivePaths = JSON.parse(formData.get("relitivePaths"));
  // const webKitRelitivePathsArr = [...Object.entries(webKitRelitivePaths)];


  // async function streamToBuffer(readableStream) {
  //   return new Promise((resolve, reject) => {
  //     const chunks = [];
  //     readableStream.on("data", data => {
  //       if (typeof data === 'string') {
  //         chunks.push(Buffer.from(data, 'utf-8'));
  //       } else if (data instanceof Buffer) {
  //         chunks.push(data);
  //       } else {
  //         const jsonData = JSON.stringify(data);
  //         chunks.push(Buffer.from(jsonData, 'utf-8'));
  //       }
  //     });
  //     readableStream.on('end', () => {
  //       resolve(Buffer.concat(chunks));
  //     });
  //     readableStream.on('error', reject);
  //   });
  // }

  // const test = await request.formData();

  // console.log(request)
  

  // const getRelitivePaths = () => {
  //   streamToBuffer(test)
  //     .then(fileData => {
  //       // const formToObj = Object.fromEntries(new FormData(fileData));
  //       // const webKitRelitivePathsArr = Object.entries(JSON.parse(formToObj.relitivePaths));
  //       // console.log("aklsjdfklasj;dflkja;::::: ", webKitRelitivePathsArr);
  //       console.log(fileData);
  //     })
  //     .catch(error => console.error('Error: ', error));
  // }

  // getRelitivePaths();

  // console.log(triggerWriteData());

  // if (triggerWriteData) {
    // const newStream = formData.stream();

    // const uploadHandler = unstable_composeUploadHandlers(
    //   unstable_createFileUploadHandler({
    //     maxPartSize: 5_000_000,
    //     file: ({ filename }) => filename,
    //     directory: "cloud",
    //   }),
    //   unstable_createMemoryUploadHandler()
    // );
  
    // await unstable_parseMultipartFormData(
    //   newStream,
    //   uploadHandler
    // );
  // }

  const placehodler = {};
  return new Response(JSON.stringify(placehodler), {
    status: 200,
    headers : {
      "Content-Type": "application/json",
    }
  });
};
