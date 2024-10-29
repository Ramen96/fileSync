import folder from "../../../../../assets/yellow-folder.svg"
import "../displayDirectory.css";

export default function Folder({
  name,
  id, 
  handleFolderClick,
  isIcon
}) {
  return (
    isIcon
      ?
        <div className="conA" onClick={() => {
          handleFolderClick(id);
        }}>
          <div className="conB">
            <img className="folderImg" src={folder} alt="folder" />
            <p className="itemName">{name}</p>
          </div>
        </div>
      : 
        <div className="rowWrapper mainBorder" onClick={() => {
          handleFolderClick(id);
        }}>
          <div className="centerAllFlex width100">
            <img className="folderImgRow" src={folder} alt="folder" />
            <p className="itemName marginNone textStart">{name}</p>
          </div>
          <input 
            className="alignSelf-flexEnd margin1rem" 
            type="checkbox" 
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => console.log("Checkbox toggled:", e.target.checked)}
            id={id} />
        </div>
  )
}
