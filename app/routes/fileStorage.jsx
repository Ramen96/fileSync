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

export const action = ({ request }) => {
  const myObject = {
    "key" : "value"
  }

  console.log("request", request);

  return new Response(JSON.stringify(myObject), {
    status: 200,
    headers : {
      "Content-Type": "application/json",
    }
  })
} 