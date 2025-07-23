import { useState } from "react";
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

  const itemType = isFolder ? "FOLDER" : "FILE";
  const cardClass = isFolder ? "cyber-folder-card" : "cyber-file-card";
  const rowClass = isFolder ? "cyber-folder-row" : "cyber-file-row";

  const handleDoubleClick = () => {
    if (isFolder && handleFolderClick) {
      handleFolderClick(id);
    }
  };

  const FolderIcon = () => (
    <svg className="cyber-folder-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Background folder */}
      <path
        className="folder-back"
        d="M10 25 L35 25 L40 20 L90 20 L90 75 L10 75 Z"
      />
      {/* Front folder */}
      <path
        className="folder-front"
        d="M15 30 L35 30 L40 25 L85 25 L85 70 L15 70 Z"
      />
      {/* Animated dot */}
      <circle
        className="folder-dot"
        cx="50"
        cy="47.5"
        r="3"
      />
      {/* Dot clip path for animation */}
      <defs>
        <clipPath id={`folderClip${id}`}>
          <circle cx="50" cy="47.5" r="0">
            <animate attributeName="r" values="0;25;0" dur="2s" repeatCount="indefinite" />
          </circle>
        </clipPath>
      </defs>
    </svg>
  );

  const FileIcon = () => (
    <svg className="cyber-folder-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Main file shape */}
      <path
        className="file-shape"
        d="M20 15 L65 15 L80 30 L80 85 L20 85 Z"
      />
      {/* Corner fold */}
      <path
        className="file-corner"
        d="M65 15 L65 30 L80 30 Z"
      />
      {/* Animated dot */}
      <circle
        className="file-dot"
        cx="50"
        cy="50"
        r="3"
      />
      {/* Document lines */}
      <g className="file-lines" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none">
        <line x1="30" y1="40" x2="70" y2="40" />
        <line x1="30" y1="50" x2="70" y2="50" />
        <line x1="30" y1="60" x2="50" y2="60" />
      </g>
      {/* Dot clip path for animation */}
      <defs>
        <clipPath id={`fileClip${id}`}>
          <circle cx="50" cy="50" r="0">
            <animate attributeName="r" values="0;25;0" dur="2s" repeatCount="indefinite" />
          </circle>
        </clipPath>
      </defs>
    </svg>
  );

  return isIcon ? (
    <div
      onClick={() => handleChecked()}
      className={`cyber-item-card ${cardClass} ${checked ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`cyber-card-selection-overlay ${checked ? 'selected' : ''}`}>
        <div className="cyber-selection-pulse"></div>
      </div>
      
      {isFolder ? <FolderIcon /> : <FileIcon />}
      
      <div className="cyber-item-info">
        <h3 className="cyber-item-name">{name}</h3>
      </div>
    </div>
  ) : (
    <div
      onClick={() => handleChecked()}
      className={`cyber-row-item ${rowClass}`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="cyber-row-content">
        <div className="cyber-row-icon-wrapper">
          {isFolder ? (
            <svg className="cyber-row-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path
                className="folder-back"
                d="M10 25 L35 25 L40 20 L90 20 L90 75 L10 75 Z"
                fill="#2fd6b5"
              />
              <path
                className="folder-front"
                d="M15 30 L35 30 L40 25 L85 25 L85 70 L15 70 Z"
                fill="#47ecc7"
              />
            </svg>
          ) : (
            <svg className="cyber-row-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path
                className="file-shape"
                d="M20 15 L65 15 L80 30 L80 85 L20 85 Z"
                fill="#ff0049"
              />
              <path
                className="file-corner"
                d="M65 15 L65 30 L80 30 Z"
                fill="#ff2a69"
              />
              <g stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none">
                <line x1="30" y1="40" x2="70" y2="40" />
                <line x1="30" y1="50" x2="70" y2="50" />
                <line x1="30" y1="60" x2="50" y2="60" />
              </g>
            </svg>
          )}
          <div className="cyber-row-icon-glow"></div>
        </div>
        
        <div className="cyber-row-info">
          <p className="cyber-row-name">{name}</p>
          <span className="cyber-row-type">{itemType}</span>
        </div>
      </div>

      <div className="cyber-row-actions">
        <div className={`cyber-select-badge ${checked ? 'selected' : ''}`}>
          <span className="cyber-select-text">{checked ? 'SELECTED' : 'SELECT'}</span>
        </div>
      </div>
      
      <div className="cyber-row-overlay"></div>
    </div>
  );
}