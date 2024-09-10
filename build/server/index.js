import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
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
const folderIcon = "../assets/folder.svg";
const plusIcon = "../assets/plus.svg";
const computerIcon = "../assets/computer.svg";
const folderIcon2 = "../assets/folder2.svg";
const photosIcon = "../assets/photo.svg";
const trashIcon = "../assets/trash.svg";
function SideBar() {
  const navigate = useNavigate();
  const routeHome = () => navigate("/");
  return /* @__PURE__ */ jsxs("div", { className: "sidebar", children: [
    /* @__PURE__ */ jsxs("button", { onClick: routeHome, className: "logo animate35s", children: [
      /* @__PURE__ */ jsx("img", { className: "folderIcon", src: folderIcon, alt: "folder icon" }),
      /* @__PURE__ */ jsx("h1", { children: "FileSync" })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "nbWrapper", children: /* @__PURE__ */ jsxs("button", { className: "newButton animate3s", children: [
      /* @__PURE__ */ jsx("img", { className: "plusButtonSvg", src: plusIcon, alt: "plus icon" }),
      /* @__PURE__ */ jsx("p", { children: "New" })
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
      /* @__PURE__ */ jsxs("div", { className: "searchbarwrapper flex-jc-ai w100 main-bg", children: [
        /* @__PURE__ */ jsx("button", { className: "submitButton", children: /* @__PURE__ */ jsx("img", { className: "searchIcon", src: searchIcon, alt: "search icon" }) }),
        /* @__PURE__ */ jsx("input", { className: "searchBar", id: "searchbar", type: "text", placeholder: "Search drive" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mainWindow main-bg" })
    ] })
  ] });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-CSMC4Wpz.js", "imports": ["/assets/index-CeAdayat.js", "/assets/components-5TG41KHH.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-qp5U72St.js", "imports": ["/assets/index-CeAdayat.js", "/assets/components-5TG41KHH.js"], "css": ["/assets/root-DqiJVx6s.css"] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-KQuKOLBX.js", "imports": ["/assets/index-CeAdayat.js"], "css": ["/assets/_index-BQROvA9b.css"] } }, "url": "/assets/manifest-830480a5.js", "version": "830480a5" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "unstable_singleFetch": false, "unstable_lazyRouteDiscovery": false };
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
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
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
