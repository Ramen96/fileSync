import { useState } from "react";
import file from "../../../assets/file2.svg";
import "../../css/file-folder.css";

export default function File({
  name,
  isIcon,
  handleDeleteQueue,
  id
}) {

  const [checked, setChecked] = useState(false);

  const handleChecked = () => {
    const metadataObject = {
      id: id,
      name: name,
      type: "file"
    }
    if (checked === true) {
      setChecked(false);
      handleDeleteQueue(checked, metadataObject);
    } else {
      setChecked(true);
      handleDeleteQueue(checked, metadataObject);
    };
  }

  return (
    isIcon  
      ?
        <div className="conA" onClick={() => {
          handleChecked();
        }}>
          <div className="conB justifyStart">
            <label className="cb-con test">
              <input checked={checked} onChange={e => console.log(e.target.value)} className="checkbox" type="checkbox" />
              <span 
                onClick={(e) => {
                  e.preventDefault();
                  handleChecked();
                }} className="checkmark"></span>
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
      <div 
        onClick={() => {
          handleChecked();
        }}
        className="rowWrapper mainBorder">
        <div className="centerAllFlex width100">
          <img className="folderImgRow" src={file} alt="folder" />
          <p className="itemName marginNone textStart">{name}</p>
        </div>
        <label className="cb-con" >
          <input checked={checked} onChange={e => console.log(e.target.value)} className="checkbox" type="checkbox" />
          <span 
            onClick={(e) => {
            e.preventDefault();
            handleChecked();
          }} className="checkmark"></span>
        </label>
      </div>
  )
}
