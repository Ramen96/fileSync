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
        <div className="rowWrapper mainBorder vc" onClick={() => {
          handleFolderClick(id);
        }}>
          <div className="centerAllFlex width100">
            <img className="folderImgRow" src={folder} alt="folder" />
            <p className="itemName marginNone textStart">{name}</p>
          </div>
          <label className="cb-con" onClick={(e) => e.stopPropagation()}>
            <input className="checkbox" type="checkbox" />
            <span className="checkmark"></span>
          </label>
        </div>
  )
}
