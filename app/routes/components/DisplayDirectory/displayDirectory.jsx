import File from "./File/file";
import Folder from "./Folder/folder";
import { DirectoryTree } from "../../../utils/DataStructures/directoryTree";

export default function DisplayDirectory({ files }) {

  const constructDirTree = new DirectoryTree();

  files.map(file => {
    const path = file.relitive_path;
    const type = () => {
      if(file.file_type === 'folder') {
        return 'folder';
      } else {
        return 'file';
      }
    }

    try {
      constructDirTree.addNodeByPath(path, type());
    } catch {
      console.error(error.message)
    }
  });

  console.log(constructDirTree);

  if (!files || files.length === 0) {
    return (
      <h1 style={{ color: "white" }}>
        No Files (files is {JSON.stringify(files)})
      </h1>
    );
  }

  return (
    <div>
      <h1 style={{ color: "red" }}>Files here</h1>
      <ul>
        {files.map((file) => (
          <li style={{ color: "white", margin: "1rem" }} key={file.id}>
            File Path: {file.relitive_path}, File Type: {file.file_type}
          </li>
        ))}
      </ul>
    </div>
  );
}
