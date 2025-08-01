import "../../css/sidebar.css";
import {
  FileUpIcon,
  FilePlus,
  FolderPlus,
  FolderUpIcon,
} from "lucide-react";
import { IndexContext } from "../../utils/context";
import { useEffect, useContext } from "react";

const folderIcon = "../assets/folder.svg";

export default function SideBar() {
  const { fileUpload, displayNodeId } = useContext(IndexContext);
  useEffect(() => {
    console.log(`SideBar component mounted with displayNodeId: ${displayNodeId}`);
  }, [displayNodeId]);

  const fileActions = [
    {
      id: 5,
      name: 'Upload File',
      icon: <FileUpIcon className="selectorIcon" />,
      uploadMultiple: false,
      webkitdirectory: false
    },
    {
      id: 6,
      name: 'Upload Folder',
      icon: <FolderUpIcon className="selectorIcon" />,
      uploadMultiple: true,
      webkitdirectory: true
    },
    {
      id: 7,
      name: 'New Folder',
      icon: <FolderPlus className="selectorIcon" />,
      uploadMultiple: false,
      webkitdirectory: false
    },
    {
      id: 8,
      name: 'New Document',
      icon: <FilePlus className="selectorIcon" />,
      uploadMultiple: false,
      webkitdirectory: false
    },
  ];

  const handleFileUpload = (event) => {
    // if (!displayNodeId) {
    //   console.error('No display node ID available');
    //   return;
    // }
    fileUpload(event);
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
              <label htmlFor={action.id} className="action-text pointer">
                {action.name}
              </label>
              <input
                onChange={handleFileUpload}
                style={{ display: "none" }}
                type="file"
                id={action.id}
                multiple={action.uploadMultiple}
                {...(action.webkitdirectory ? { webkitdirectory: "true" } : {})}
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}