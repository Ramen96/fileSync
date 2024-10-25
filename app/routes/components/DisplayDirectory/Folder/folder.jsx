import folder from "../../../../../assets/yellow-folder.svg"
import "../displayDirectory.css";

export default function Folder({
  name,
  id, 
  handleFolderClick
}) {
  return (
    <div className="conA" onClick={() => {
      handleFolderClick(id)
    }}>
      <div className="conB">
        <img className="folderImg" src={folder} alt="folder" />
        <p className="itemName">{name}</p>
      </div>
    </div>
  )
}
