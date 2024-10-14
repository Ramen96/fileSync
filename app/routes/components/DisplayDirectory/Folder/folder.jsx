// import "./folder.css";
import folder from "../../../../../assets/folder2.svg"
import "../displayDirectory.css";

export default function Folder({
  name,
  id, 
  setCurrentNodeId,
  setParrentNodeId,
  parrentNodeId
}) {
  return (
    <div className="conA" onClick={() => {
      setCurrentNodeId(id);
      setParrentNodeId(parrentNodeId)
    }}>
      <div className="conB">
        <img className="folderImg" src={folder} alt="folder" />
        <p className="itemName">{name}</p>
      </div>
    </div>
  )
}
