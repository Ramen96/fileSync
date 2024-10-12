import "./file.css";
import file from "../../../../../assets/file.svg";

export default function File({name}) {
  return (
    <div className="conA">
      <img className="folderImg" src={file} alt="folder" />
      <h1>{name}</h1>
    </div>
  )
}
