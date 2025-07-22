import { useState } from "react";
import folder from "../../../assets/yellow-folder.svg";
import "../../css/file-folder.css";

export default function Folder({
  name,
  id,
  handleFolderClick,
  isIcon,
  handleDeleteQueue,
}) {
  const [checked, setChecked] = useState(false);
  
  const handleChecked = () => {
    const metadataObject = {
      id: id,
      name: name,
      type: "folder",
    };
    if (checked === true) {
      setChecked(false);
      handleDeleteQueue(checked, metadataObject);
    } else {
      setChecked(true);
      handleDeleteQueue(checked, metadataObject);
    }
  };

  return isIcon ? (
    <div
      onClick={() => handleChecked()}
      className="cyber-item-card cyber-folder-card"
      onDoubleClick={() => {
        handleFolderClick(id);
      }}
    >
      <div className="cyber-card-header">
        <div className="cyber-checkbox-wrapper">
          <label className="cyber-checkbox-container" onClick={(e) => e.stopPropagation()}>
            <input
              checked={checked}
              onChange={(e) => console.log(e.target.value)}
              className="cyber-checkbox-input"
              type="checkbox"
            />
            <span
              onClick={(e) => {
                e.preventDefault();
                handleChecked();
              }}
              className="cyber-checkmark"
            >
              <div className="cyber-check-icon"></div>
            </span>
          </label>
        </div>
        <div className="cyber-status-indicator cyber-folder-indicator"></div>
      </div>
      
      <div className="cyber-icon-container">
        <div className="cyber-icon-wrapper">
          <img className="cyber-item-icon" src={folder} alt="folder" />
          <div className="cyber-icon-glow"></div>
        </div>
      </div>
      
      <div className="cyber-item-info">
        <h3 className="cyber-item-name">{name}</h3>
        <span className="cyber-item-type">FOLDER</span>
      </div>
      
      <div className="cyber-card-overlay"></div>
    </div>
  ) : (
    <div
      onClick={() => handleChecked()}
      className="cyber-row-item cyber-folder-row"
      onDoubleClick={() => {
        handleFolderClick(id);
      }}
    >
      <div className="cyber-row-content">
        <div className="cyber-row-icon-wrapper">
          <img className="cyber-row-icon" src={folder} alt="folder" />
          <div className="cyber-row-icon-glow"></div>
        </div>
        
        <div className="cyber-row-info">
          <p className="cyber-row-name">{name}</p>
          <span className="cyber-row-type">FOLDER</span>
        </div>
      </div>
      
      <div className="cyber-row-actions">
        <label className="cyber-checkbox-container cyber-row-checkbox" onClick={(e) => e.stopPropagation()}>
          <input
            checked={checked}
            onChange={(e) => console.log(e.target.value)}
            className="cyber-checkbox-input"
            type="checkbox"
          />
          <span
            onClick={(e) => {
              e.preventDefault();
              handleChecked();
            }}
            className="cyber-checkmark"
          >
            <div className="cyber-check-icon"></div>
          </span>
        </label>
      </div>
      
      <div className="cyber-row-overlay"></div>
    </div>
  );
}