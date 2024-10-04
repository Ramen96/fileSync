import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, json } from "@remix-run/node";
import { RemixServer, Meta, Links, Outlet, Scripts, useLoaderData, useNavigate } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { PrismaClient } from "@prisma/client";
import * as fs from "node:fs/promises";
import path from "node:path";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  let prohibitOutOfOrderStreaming = isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode;
  return prohibitOutOfOrderStreaming ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function isBotRequest(userAgent) {
  if (!userAgent) {
    return false;
  }
  if ("isbot" in isbotModule && typeof isbotModule.isbot === "function") {
    return isbotModule.isbot(userAgent);
  }
  if ("default" in isbotModule && typeof isbotModule.default === "function") {
    return isbotModule.default(userAgent);
  }
  return false;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function App() {
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("link", { rel: "icon", href: "assets/folder.svg", type: "image/svg+xml", id: "favicon" }),
      /* @__PURE__ */ jsx("title", { children: "FileSync" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App
}, Symbol.toStringTag, { value: "Module" }));
function Folder() {
  return /* @__PURE__ */ jsx("p", { style: { color: "white" }, children: "Folder" });
}
function File$1() {
  return /* @__PURE__ */ jsx("p", { style: { color: "white" }, children: "File" });
}
let prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
  prisma.$connect();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
    global.__db.$connect();
  }
  prisma = global.__db;
}
async function loader() {
  return json(await prisma.file_data.findMany({
    where: {
      id: {
        equals: 1
      }
    }
  }));
}
function DisplayDirectory() {
  const data = useLoaderData();
  console.log("data: ", data);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Folder, {}),
    /* @__PURE__ */ jsx(
      "p",
      {
        style: {
          color: "red"
        },
        children: "Hello World"
      }
    ),
    /* @__PURE__ */ jsx(File$1, {})
  ] });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: DisplayDirectory,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const action = async ({ request }) => {
  const pathTraversalDetection = (path2) => {
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
      "..%c1%9c"
    ];
    let traversalDetection = void 0;
    for (let i = 0; i < traversalPatterns.length; i++) {
      let traversalState = path2.includes(traversalPatterns[i]);
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
      const path2 = webKitRelitivePath[i];
      if (pathTraversalDetection(path2)) {
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
        const writeToDb = async () => {
          await prisma.file_data.create({
            data: {
              relitive_path: fileRelitvePath,
              file_name: fileName,
              file_type: fileType,
              save_date: /* @__PURE__ */ new Date()
            }
          });
        };
        pathExists().then(async (inValidPath) => {
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
        }).catch((err) => {
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
      "Content-Type": "application/json"
    }
  });
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action
}, Symbol.toStringTag, { value: "Module" }));
const folderIcon = "../assets/folder.svg";
const plusIcon = "../assets/plus.svg";
const computerIcon = "../assets/computer.svg";
const folderIcon2 = "../assets/folder2.svg";
const photosIcon = "../assets/photo.svg";
const trashIcon = "../assets/trash.svg";
const fileIcon = "../assets/file.svg";
function SideBar() {
  const navigate = useNavigate();
  const routeHome = () => navigate("/");
  function fileUpload(event) {
    const file = event.target.files;
    const fileList = new FormData();
    for (let i = 0; i < file.length; i++) {
      fileList.append(file[i].name, file[i]);
    }
    fetch("fileStorage", {
      method: "POST",
      body: fileList
    });
  }
  return /* @__PURE__ */ jsxs("div", { className: "sidebar", children: [
    /* @__PURE__ */ jsxs("button", { onClick: routeHome, className: "logo animate35s", children: [
      /* @__PURE__ */ jsx("img", { className: "folderIcon", src: folderIcon, alt: "folder icon" }),
      /* @__PURE__ */ jsx("h1", { children: "FileSync" })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "nbWrapper", children: /* @__PURE__ */ jsxs("button", { className: "newButton animate3s dropdown", children: [
      /* @__PURE__ */ jsxs("div", { className: "centerSVG", children: [
        /* @__PURE__ */ jsx("img", { className: "plusButtonSvg", src: plusIcon, alt: "plus icon" }),
        /* @__PURE__ */ jsx("p", { children: "New" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "dropdown-content", children: /* @__PURE__ */ jsxs("ul", { className: "dropdown-items", children: [
        /* @__PURE__ */ jsx("li", { className: "dropdown-element", children: /* @__PURE__ */ jsxs("div", { role: "button", className: "drp-btn-e", children: [
          /* @__PURE__ */ jsx("img", { className: "dropdownIcon", src: fileIcon, alt: "file icon" }),
          /* @__PURE__ */ jsx("label", { htmlFor: "uploadFile", children: /* @__PURE__ */ jsx("h4", { className: "pointer", children: "Upload File" }) }),
          /* @__PURE__ */ jsx("input", { onChange: fileUpload, style: { "display": "none" }, type: "file", id: "uploadFile" })
        ] }) }),
        /* @__PURE__ */ jsx("li", { className: "dropdown-element", children: /* @__PURE__ */ jsxs("div", { role: "button", className: "drp-btn-e", children: [
          /* @__PURE__ */ jsx("img", { className: "dropdownIcon", src: folderIcon2, alt: "file icon" }),
          /* @__PURE__ */ jsx("label", { htmlFor: "uploadFolder", children: /* @__PURE__ */ jsx("h4", { className: "pointer", children: "Upload Folder" }) }),
          /* @__PURE__ */ jsx("input", { style: { "display": "none" }, onChange: fileUpload, type: "file", multiple: true, webkitdirectory: "true", id: "uploadFolder" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "spacer" }),
        /* @__PURE__ */ jsx("li", { className: "dropdown-element", children: /* @__PURE__ */ jsxs("div", { role: "button", className: "drp-btn-e", children: [
          /* @__PURE__ */ jsx("img", { className: "dropdownIcon", src: folderIcon2, alt: "file icon" }),
          /* @__PURE__ */ jsx("h4", { children: "New Folder" })
        ] }) }),
        /* @__PURE__ */ jsx("li", { className: "dropdown-element", children: /* @__PURE__ */ jsxs("div", { role: "button", className: "drp-btn-e", children: [
          /* @__PURE__ */ jsx("img", { className: "dropdownIcon", src: fileIcon, alt: "file icon" }),
          /* @__PURE__ */ jsx("h4", { children: "New Document" })
        ] }) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("ul", { className: "selectorWrapper", children: [
      /* @__PURE__ */ jsx("a", { className: "selector", href: "#", children: /* @__PURE__ */ jsxs("li", { className: "selectorItem animate25s", children: [
        /* @__PURE__ */ jsx("img", { className: "selectorIcon", src: computerIcon, alt: "computer" }),
        /* @__PURE__ */ jsx("p", { className: "selectorText", children: "Computers" })
      ] }) }),
      /* @__PURE__ */ jsx("a", { className: "selector", href: "#", children: /* @__PURE__ */ jsxs("li", { className: "selectorItem animate2s", children: [
        /* @__PURE__ */ jsx("img", { className: "selectorIcon", src: folderIcon2, alt: "folder icon" }),
        /* @__PURE__ */ jsx("p", { className: "selectorText", children: "Files" })
      ] }) }),
      /* @__PURE__ */ jsx("a", { className: "selector", href: "#", children: /* @__PURE__ */ jsxs("li", { className: "selectorItem animate15s", children: [
        /* @__PURE__ */ jsx("img", { className: "selectorIcon", src: photosIcon, alt: "photos icon" }),
        /* @__PURE__ */ jsx("p", { className: "selectorText", children: "Photos" })
      ] }) }),
      /* @__PURE__ */ jsx("a", { className: "selector", href: "#", children: /* @__PURE__ */ jsxs("li", { className: "selectorItem animate1s", children: [
        /* @__PURE__ */ jsx("img", { className: "selectorIcon", src: trashIcon, alt: "trash icon" }),
        /* @__PURE__ */ jsx("p", { className: "selectorText", children: "Trash" })
      ] }) })
    ] }) })
  ] });
}
const searchIcon = "../assets/search.svg";
function Index() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(SideBar, {}),
    /* @__PURE__ */ jsxs("div", { className: "main", children: [
      /* @__PURE__ */ jsxs("div", { className: "searchbarwrapper flex-jc-ai  main-bg", children: [
        /* @__PURE__ */ jsx("button", { className: "submitButton", children: /* @__PURE__ */ jsx("img", { className: "searchIcon", src: searchIcon, alt: "search icon" }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "searchBar",
            id: "searchbar",
            type: "text",
            placeholder: "Search drive"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mainWindow main-bg", children: /* @__PURE__ */ jsx(DisplayDirectory, {}) })
    ] })
  ] });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BtZnCMf9.js", "imports": ["/assets/components-CQBjiHXJ.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-R3DCSY7w.js", "imports": ["/assets/components-CQBjiHXJ.js"], "css": ["/assets/root-C-rFmPHj.css"] }, "routes/displayDirectory": { "id": "routes/displayDirectory", "parentId": "root", "path": "displayDirectory", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/displayDirectory-BpLDxJOO.js", "imports": ["/assets/components-CQBjiHXJ.js"], "css": [] }, "routes/fileStorage": { "id": "routes/fileStorage", "parentId": "root", "path": "fileStorage", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/fileStorage-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-73Gtx-dK.js", "imports": ["/assets/components-CQBjiHXJ.js", "/assets/displayDirectory-BpLDxJOO.js"], "css": ["/assets/_index-C3lv2onq.css"] } }, "url": "/assets/manifest-c879cea9.js", "version": "c879cea9" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "unstable_singleFetch": false, "unstable_lazyRouteDiscovery": false, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/displayDirectory": {
    id: "routes/displayDirectory",
    parentId: "root",
    path: "displayDirectory",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/fileStorage": {
    id: "routes/fileStorage",
    parentId: "root",
    path: "fileStorage",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route3
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
