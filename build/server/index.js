import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { RemixServer, Meta, Links, Outlet, Scripts, useNavigate } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
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
const action = async ({ request }) => {
  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5e6,
      file: ({ filename }) => filename,
      directory: "cloud"
    }),
    unstable_createMemoryUploadHandler()
  );
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );
  console.log("formData", formData);
  const myObject = {
    "key": "value"
  };
  console.log("request", request.headers);
  return new Response(JSON.stringify(myObject), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
    console.log(file);
    const fileList = new FormData();
    for (let i = 0; i < file.length; i++) {
      const fileListItem = file[i];
      fileListItem.name;
      fileList.append(file[i].name, file[i]);
    }
    fileList.getAll("name");
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
      ] }) }),
      /* @__PURE__ */ jsx("button", { onClick: () => {
        fetch("/fileStorage", {
          method: "POST"
        }).then((res) => res.json()).then((data) => console.log("data: ", data));
      }, className: "selector", children: /* @__PURE__ */ jsx("h1", { children: "Click me" }) })
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
        /* @__PURE__ */ jsx("input", { className: "searchBar", id: "searchbar", type: "text", placeholder: "Search drive" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mainWindow main-bg" })
    ] })
  ] });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BSEQBc5l.js", "imports": ["/assets/index-CZ3PrqHY.js", "/assets/components-CR5cdnQn.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-jPBstzeA.js", "imports": ["/assets/index-CZ3PrqHY.js", "/assets/components-CR5cdnQn.js"], "css": ["/assets/root-C-rFmPHj.css"] }, "routes/fileStorage": { "id": "routes/fileStorage", "parentId": "root", "path": "fileStorage", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/fileStorage-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-ppv-FQpG.js", "imports": ["/assets/index-CZ3PrqHY.js"], "css": ["/assets/_index-C3lv2onq.css"] } }, "url": "/assets/manifest-e449b1e5.js", "version": "e449b1e5" };
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
  "routes/fileStorage": {
    id: "routes/fileStorage",
    parentId: "root",
    path: "fileStorage",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route2
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
