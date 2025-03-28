import { Links, Meta, Outlet, Scripts } from "react-router";
import "./css/root.css";

export default function App() {
  return (
    <html>
      <head>
        <link rel="icon" href="assets/folder.svg" type="image/svg+xml" id="favicon" />
        <title>FileSync</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />

        <Scripts />
      </body>
    </html>
  );
}
