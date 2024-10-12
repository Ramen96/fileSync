import "./folder.css";
import folder from "../../../../../assets/folder2.svg"

export default function Folder({
  name,
  id, 
  setCurrentNodeId,
  treeStructure
}) {
  console.log('folder component id', id);
  return (
    <div className="conA" onClick={() => setCurrentNodeId(id)}>
      <img className="folderImg" src={folder} alt="folder" />
      <h1>{name}</h1>
    </div>
  )
}
