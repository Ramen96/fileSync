import { useState } from "react";
import folder from "../../../../../assets/yellow-folder.svg"
import "../displayDirectory.css";

export default function Folder({
  name,
  id, 
  handleFolderClick,
  isIcon
}) {
  
  const [checked, setChecked] = useState(false);

  const handleChecked = () => {
    if (checked === true) {
      setChecked(false);
    } else {
      setChecked(true);
    };
  }

  return (
    isIcon
      ?
        <div 
          onClick={() => handleChecked()}
          className="conA" onDoubleClick={() => {
          handleFolderClick(id);
        }}>
          <div 
            className="conB justifyStart">
            <label className="cb-con test" onClick={(e) => e.stopPropagation()}>
              {checked
                ? <input checked="checked" className="checkbox" type="checkbox" />
                : <input className="checkbox" type="checkbox" />
              }
              <span className="checkmark"></span>
            </label>
          </div>
          <div className="conB border-bottom">
            <img className="folderImg margin1rem" src={folder} alt="folder" />
          </div>
          <div className="conB">
            <h3 className="itemName">{name}</h3>
          </div>
        </div>
      : 
        <div onClick={() => handleChecked()} className="rowWrapper mainBorder vc" onDoubleClick={() => {
          handleFolderClick(id);
        }}>
          <div className="centerAllFlex width100">
            <img className="folderImgRow" src={folder} alt="folder" />
            <p className="itemName marginNone textStart">{name}</p>
          </div>
          <label className="cb-con" onClick={(e) => e.stopPropagation()}>
            {checked
              ? <input checked="checked" className="checkbox" type="checkbox" />
              : <input className="checkbox" type="checkbox" />
            }
            <span className="checkmark"></span>
          </label>
        </div>
  )
}
