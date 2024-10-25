import file from "../../../../../assets/file2.svg";
import "../displayDirectory.css";

export default function File({name}) {
  return (
    <div className="conA">
      <div className="conB">
        <img className="folderImg" src={file} alt="folder" />
        <p className="itemName">{name}</p>
      </div>
    </div>
  )
}
