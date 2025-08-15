import { type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
  index("./routes/_index.jsx"),
  route("databaseAPI", "./routes/databaseAPI.jsx"),
  route("fileDelete", "./routes/fileDelete.jsx"),
  route("uploadAPI", "./routes/uploadAPI.jsx"),
  route("createNew", "./routes/createNew.jsx")
]