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
          <label className="cb-con" onClick={(e) => e.stopPropagation()}>
            <input className="checkbox" type="checkbox" />
            <span className="checkmark"></span>
          </label>
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
        <label className="cb-con" onClick={(e) => e.stopPropagation()}>
          <input className="checkbox" type="checkbox" />
          <span className="checkmark"></span>
        </label>
      </div>
  )
}
