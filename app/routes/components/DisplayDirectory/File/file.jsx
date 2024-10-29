import file from "../../../../../assets/file2.svg";
import "../displayDirectory.css";

export default function File({
  name,
  isIcon,
  id
}) {
  return (
    isIcon  
      ?
        <div className="conA">
          <div className="conB">
            <img className="folderImg" src={file} alt="folder" />
            <p className="itemName">{name}</p>
          </div>
        </div>
      :
      <div className="rowWrapper mainBorder">
        <div className="centerAllFlex width100">
          <img className="folderImgRow" src={file} alt="folder" />
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
