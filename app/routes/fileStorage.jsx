import { json, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler, unstable_composeUploadHandlers, unstable_createFileUploadHandler } from "@remix-run/node";




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
  

  // const uploadHandler = unstable_composeUploadHandlers(
    
  //   unstable_createMemoryUploadHandler()
  // );

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createMemoryUploadHandler()
  )

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const webKitRelitivePaths = JSON.parse(formData.get("relitivePaths"));
  const webKitRelitivePathsArr = [...Object.entries(webKitRelitivePaths)]

  for (let i = 0; i < webKitRelitivePathsArr.length; i++) {
    const relitivePath = webKitRelitivePathsArr[i][1]; 
    const fileName = webKitRelitivePathsArr[i][0];
    // ToDo:
    // pass relitvePath to sanitizePath() 
    // return boolen value to determine if path traversal is dectected
    // if detected throw error and do not write files to system
    // else use relitve path as path to save inside of cloud/
    console.log("relitvePath: ", relitivePath);
    if (pathTraversalDetection(relitivePath)) {
      throw new Error("Warning: path traversal is true.");
    } else {
      unstable_createFileUploadHandler({
        maxPartSize: 5_000_000,
        file: ({ filename }) => filename,
        directory: `cloud/${relitivePath}/${fileName}`,
      });
    }
  }

  return new Response(JSON.stringify(webKitRelitivePaths), {
    status: 200,
    headers : {
      "Content-Type": "application/json",
    }
  });
};
