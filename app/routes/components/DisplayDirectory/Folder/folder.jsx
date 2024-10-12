import "./folder.css";
import folder from "../../../../../assets/folder2.svg"

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
      <img className="folderImg" src={folder} alt="folder" />
      <h1>{name}</h1>
    </div>
  )
}
