import { useState } from "react";
import folder from "../../../assets/yellow-folder.svg";
import file from "../../../assets/file2.svg";
import "../../css/fileSystemItem.css";

export default function FileSystemItem({
  name,
  id,
  isFolder = false,
  handleFolderClick,
  isIcon,
  handleDeleteQueue,
}) {
  const [checked, setChecked] = useState(false);
  
  const handleChecked = () => {
    const metadataObject = {
      id: id,
      name: name,
      type: isFolder ? "folder" : "file",
    };
    if (checked === true) {
      setChecked(false);
      handleDeleteQueue(checked, metadataObject);
    } else {
      setChecked(true);
      handleDeleteQueue(checked, metadataObject);
    }
  };

  const iconSrc = isFolder ? folder : file;
  const itemType = isFolder ? "FOLDER" : "FILE";
  const cardClass = isFolder ? "cyber-folder-card" : "cyber-file-card";
  const rowClass = isFolder ? "cyber-folder-row" : "cyber-file-row";
  const indicatorClass = isFolder ? "cyber-folder-indicator" : "cyber-file-indicator";

  const handleDoubleClick = () => {
    if (isFolder && handleFolderClick) {
      handleFolderClick(id);
    }
  };

  return isIcon ? (
    <div
      onClick={() => handleChecked()}
      className={`cyber-item-card ${cardClass}`}
      onDoubleClick={handleDoubleClick}
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
        <div className={`cyber-status-indicator ${indicatorClass}`}></div>
      </div>
      
      <div className="cyber-icon-container">
        <div className="cyber-icon-wrapper">
          <img className="cyber-item-icon" src={iconSrc} alt={itemType.toLowerCase()} />
          <div className="cyber-icon-glow"></div>
        </div>
      </div>
      
      <div className="cyber-item-info">
        <h3 className="cyber-item-name">{name}</h3>
        <span className="cyber-item-type">{itemType}</span>
      </div>
      
      <div className="cyber-card-overlay"></div>
    </div>
  ) : (
    <div
      onClick={() => handleChecked()}
      className={`cyber-row-item ${rowClass}`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="cyber-row-content">
        <div className="cyber-row-icon-wrapper">
          <img className="cyber-row-icon" src={iconSrc} alt={itemType.toLowerCase()} />
          <div className="cyber-row-icon-glow"></div>
        </div>
        
        <div className="cyber-row-info">
          <p className="cyber-row-name">{name}</p>
          <span className="cyber-row-type">{itemType}</span>
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