import File from "./File/file";
import Folder from "./Folder/folder";

export default function DisplayDirectory({ files }) {
  const fileData = () => {
    const pathArr = [];

    files.forEach((file) => {
      const removeFileName = file.relitive_path.slice(
        0,
        file.relitive_path.lastIndexOf("/")
      );
      const dirNameArr = removeFileName.split("/");

      if (
        !pathArr.some(
          (arr) => JSON.stringify(arr) === JSON.stringify(dirNameArr)
        )
      ) {
        pathArr.push(dirNameArr);
      }
    });

    console.log("arr: ", pathArr);
    return pathArr;
  };

  const filePaths = fileData();

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
