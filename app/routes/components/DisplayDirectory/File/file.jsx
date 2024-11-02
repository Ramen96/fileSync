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
        <div className="conA" onClick={() => {
          handleFolderClick(id);
        }}>
          <div className="conB justifyStart">
            <label className="cb-con test" onClick={(e) => e.stopPropagation()}>
              <input className="checkbox" type="checkbox" />
              <span className="checkmark"></span>
            </label>
          </div>
          <div className="conB border-bottom">
            <img className="folderImg margin1rem" src={file} alt="folder" />
          </div>
          <div className="conB">
            <h3 className="itemName">{name}</h3>
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
