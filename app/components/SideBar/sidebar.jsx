import "../../css/sidebar.css";
import {
  FileUpIcon,
  FilePlus,
  FolderPlus,
  FolderUpIcon,
} from "lucide-react";
import { IndexContext, DisplayDirectoryContext } from "../../utils/context";
import { useContext, useState } from "react";
import CreateCard from "../CreateCard/createCard";

const folderIcon = "../assets/folder.svg";

export default function SideBar() {
  const { fileUpload } = useContext(IndexContext);
  
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [createMode, setCreateMode] = useState(null);

  const fileActions = [
    {
      id: 5,
      name: 'Upload File',
      icon: <FileUpIcon className="selectorIcon" />,
      uploadMultiple: false,
      webkitdirectory: false,
      action: 'upload'
    },
    {
      id: 6,
      name: 'Upload Folder',
      icon: <FolderUpIcon className="selectorIcon" />,
      uploadMultiple: true,
      webkitdirectory: true,
      action: 'upload'
    },
    {
      id: 7,
      name: 'New Folder',
      icon: <FolderPlus className="selectorIcon" />,
      uploadMultiple: false,
      webkitdirectory: false,
      action: 'create-folder'
    },
    {
      id: 8,
      name: 'New Document',
      icon: <FilePlus className="selectorIcon" />,
      uploadMultiple: false,
      webkitdirectory: false,
      action: 'create-file'
    },
  ];

  const handleFileUpload = (event) => {
    fileUpload(event);
    event.target.value = "";
  };

  const handleActionClick = (action) => {
    if (action.action === 'create-folder') {
      setCreateMode('folder');
      setShowCreateCard(true);
    } else if (action.action === 'create-file') {
      setCreateMode('file');
      setShowCreateCard(true);
    }
    // Upload actions will use the default input behavior
  };

  const handleCloseCreateCard = () => {
    setShowCreateCard(false);
    setCreateMode(null);
  };

  return (
    <div className="sidebar">
      <button className="logo">
        <img className="folderIcon" src={folderIcon} alt="folder icon" />
        <h1>FileSync</h1>
      </button>
      
      <section className="selectorWrapper">
        {fileActions.map((action) => (
          <div key={action.id} className="action-button">
            <div className="action-content">
              <div className="action-icon">
                {action.icon}
              </div>
              <label htmlFor={action.id} className="action-text pointer" onClick={() => handleActionClick(action)}>
                {action.name}
              </label>
              {!action.action?.startsWith('create-') && (
                <input
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  type="file"
                  id={action.id}
                  multiple={action.uploadMultiple}
                  {...(action.webkitdirectory ? { webkitdirectory: "true" } : {})}
                />
              )}
            </div>
          </div>
        ))}
      </section>

      {showCreateCard && (
        <CreateCard 
          mode={createMode}
          onClose={handleCloseCreateCard}
        />
      )}
    </div>
  );
}