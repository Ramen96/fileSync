import Folder from "./Folder/folder";
import File from "./File/file";
export default function DisplayDirectory() {
  return(
    <>
      <Folder />
      <p style={
        {
          "color": "red"
        }
        }>Hello World</p>
      <File />
    </>
  )
}