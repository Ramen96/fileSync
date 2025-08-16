import { FolderPlus, FilePlus, XCircle, Save, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import "../../css/createCard.css";

export default function CreateCard({  mode, parentId, onClose, onSuccess }) {

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [fileType, setFileType] = useState("txt");
  const [isCreating, setIsCreating] = useState(false);

  const isFileMode = mode === "file";
  const title = isFileMode ? "Create New Document" : "Create New Folder";
  const icon = isFileMode ? FilePlus : FolderPlus;
  const placeholder = isFileMode ? "Enter document name..." : "Enter folder name...";

  // Available file types
  const fileTypes = [
    { value: "txt", label: "Text File (.txt)" },
    { value: "md", label: "Markdown (.md)" },
    { value: "js", label: "JavaScript (.js)" },
    { value: "json", label: "JSON (.json)" },
    { value: "html", label: "HTML (.html)" },
    { value: "css", label: "CSS (.css)" },
    { value: "py", label: "Python (.py)" },
    { value: "xml", label: "XML (.xml)" },
    { value: "csv", label: "CSV (.csv)" },
  ];

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsCreating(true);

    try {
      const response = await fetch('/createNew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: mode,
          name: name.trim(),
          content: isFileMode ? content : undefined,
          fileType: isFileMode ? fileType : undefined,
          parentId: parentId || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to create ${mode}`);
      }

      console.log(`${mode} created successfully:`, data);

      if (onSuccess) {
        onSuccess(data);
      }

      setIsCreating(false);
      handleClose();

    } catch (error) {
      console.error(`Create ${mode} error:`, error);
      setIsCreating(false);
      alert(error.message);
    }
  };

  const handleClose = () => {
    setName("");
    setContent("");
    setFileType("txt");
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
                File Type
              </label>
              <div className="select-wrapper">
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="file-type-select"
                >
                  {fileTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-icon" />
              </div>
            </div>
          )}

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