import { FolderPlus, FilePlus, XCircle, Save } from "lucide-react";
import React, { useState } from "react";
import "../../css/createCard.css";

export default function CreateCard({ mode, onClose }) {

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const isFileMode = mode === "file";
  const title = isFileMode ? "Create New Document" : "Create New Folder";
  const icon = isFileMode ? FilePlus : FolderPlus;
  const placeholder = isFileMode ? "Enter document name..." : "Enter folder name...";

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setIsCreating(true);
    
    // Simulate API call for visual feedback
    setTimeout(() => {
      console.log(`Would create ${mode}:`, name);
      if (content && isFileMode) {
        console.log('With content:', content);
      }
      
      setIsCreating(false);
      handleClose();
    }, 1000);
  };

  const handleClose = () => {
    setName("");
    setContent("");
    if (onClose) {
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <div className="blur-background">
      <div className="create-card-wrapper">
        <div className="title-wrapper">
          <div className="h1-wrapper">
            <h1 className="h1">{title}</h1>
            <XCircle
              onClick={handleClose}
              className="x-circle"
            />
          </div>
        </div>

        <div className="create-form">
          <div className="input-group">
            <label className="input-label">
              {isFileMode ? "Document Name" : "Folder Name"}
            </label>
            <div className="input-wrapper">
              {React.createElement(icon, { className: "input-icon" })}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={placeholder}
                className="name-input"
                autoFocus
              />
            </div>
          </div>

          {isFileMode && (
            <div className="input-group">
              <label className="input-label">
                Document Content (Optional)
              </label>
              <div className="textarea-wrapper">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter document content..."
                  className="content-textarea"
                  rows={8}
                />
              </div>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button
            onClick={handleClose}
            className="cancel-btn"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="create-btn"
            disabled={!name.trim() || isCreating}
          >
            <Save className="btn-icon" />
            {isCreating ? `Creating ${mode}...` : `Create ${mode}`}
          </button>
        </div>

        <div className="keyboard-shortcuts">
          <span className="shortcut">Enter to create</span>
          <span className="shortcut">Esc to cancel</span>
        </div>
      </div>
    </div>
  );
}