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
    }),
    unstable_createMemoryUploadHandler()
  )


  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  )

  console.log("formData", formData);

  const myObject = {
    "key" : "value"
  }

  console.log("request", request.headers);

  return new Response(JSON.stringify(myObject), {
    status: 200,
    headers : {
      "Content-Type": "application/json",
    }
  })
} 