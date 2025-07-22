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
        <div className="cyber-item-card cyber-file-card" onClick={() => {
          handleChecked();
        }}>
          <div className="cyber-card-header">
            <div className="cyber-checkbox-wrapper">
              <label className="cyber-checkbox-container">
                <input 
                  checked={checked} 
                  onChange={e => console.log(e.target.value)} 
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
            <div className="cyber-status-indicator cyber-file-indicator"></div>
          </div>
          
          <div className="cyber-icon-container">
            <div className="cyber-icon-wrapper">
              <img className="cyber-item-icon" src={file} alt="file" />
              <div className="cyber-icon-glow"></div>
            </div>
          </div>
          
          <div className="cyber-item-info">
            <h3 className="cyber-item-name">{name}</h3>
            <span className="cyber-item-type">FILE</span>
          </div>
          
          <div className="cyber-card-overlay"></div>
        </div>
      :
        <div 
          onClick={() => {
            handleChecked();
          }}
          className="cyber-row-item cyber-file-row"
        >
          <div className="cyber-row-content">
            <div className="cyber-row-icon-wrapper">
              <img className="cyber-row-icon" src={file} alt="file" />
              <div className="cyber-row-icon-glow"></div>
            </div>
            
            <div className="cyber-row-info">
              <p className="cyber-row-name">{name}</p>
              <span className="cyber-row-type">FILE</span>
            </div>
          </div>
          
          <div className="cyber-row-actions">
            <label className="cyber-checkbox-container cyber-row-checkbox">
              <input 
                checked={checked} 
                onChange={e => console.log(e.target.value)} 
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
  )
}