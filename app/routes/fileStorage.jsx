import { json, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler, unstable_composeUploadHandlers, unstable_createFileUploadHandler } from "@remix-run/node";

function sanitizePath(param) {
  const isTraversal = [
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
  ]

  param.forEach(i, () => {

  })

  // const fileList = filesUploaded[0];
  // for (let i = 0; i < fileList.length; i++) {
  //   const relitivePath = fileList[i].webkitRelativePath;
  //   const traversalTrue = [...relitivePath.matchAll(isTraversal)]; 
  //   console.log(traversalTrue)
  //   if (traversalTrue != []) {
  //     throw new Error("Path traversal blocked")
  //   } 
  //   console.log("relitive path: ", relitivePath);
  // }
}

export const action = async ({ request }) => {

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      file: ({ filename }) => filename,
      directory: "cloud",
    }),
    unstable_createMemoryUploadHandler()
  );


  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const webKitRelitivePaths = JSON.parse(formData.get("relitivePaths"));
  const webKitRelitivePathsArr = [...Object.entries(webKitRelitivePaths)]

  console.log("webKitRelitivePaths: ", webKitRelitivePathsArr[0][1]);

  return new Response(JSON.stringify(webKitRelitivePaths), {
    status: 200,
    headers : {
      "Content-Type": "application/json",
    }
  });
};
