import { useNavigate } from "react-router";
import "../../css/sidebar.css";
import {
  BookmarkPlusIcon,
  ImageIcon,
  FolderIcon,
  FileUpIcon,
  FilePlus,
  FolderPlus,
  FolderUpIcon,
  Trash2,
  Monitor,
} from "lucide-react";
const folderIcon = "../assets/folder.svg";

export default function SideBar({ fileUpload, currentNodeId }) {
  const navigate = useNavigate();
  const routeHome = () => navigate("/");

  const locations = [
    {
      id: 1,
      name: "Computers",
      Icon: <Monitor className="selectorIcon" />,
      animation: "animate25s"
    },
    {
      id: 2,
      name: "Files",
      Icon: <FolderIcon className="selectorIcon" />,
      animation: "animate2s"
    },
    {
      id: 3,
      name: "Photos",
      Icon: <ImageIcon className="selectorIcon" />,
      animation: "animate15s"
    },
    {
      id: 4,
      name: "Trash",
      Icon: <Trash2 className="selectorIcon" />,
      animation: "animate1s"
    }
  ];

  const dropdownOptions = [
    {
      id: 5,
      name: 'Upload File',
      icon: <FileUpIcon className="dropdownIcon" />,
      uploadMultiple: false
    },
    {
      id: 6,
      name: 'Upload Folder',
      icon: <FolderUpIcon className="dropdownIcon" />,
      uploadMultiple: true
    },
    {
      id: 7,
      name: 'New Folder',
      icon: <FolderPlus className="dropdownIcon" />,
      uploadMultiple: false
    },
    {
      id: 8,
      name: 'New Document',
      icon: <FilePlus className="dropdownIcon" />,
      uploadMultiple: false
    },
  ];

  return (
    <div className="sidebar">
      <button onClick={routeHome} className="logo animate35s">
        <img className="folderIcon" src={folderIcon} alt="folder icon"></img>
        <h1>FileSync</h1>
      </button>
      <section className="nbWrapper">

        {/* ********************* SECTION: Dropdown ********************** */}
        <button className="newButton animate3s dropdown">
          <div className="centerSVG">
            <BookmarkPlusIcon style={{ "margin": "0.5rem" }} />
            <p>New</p>
          </div>
          <div className="dropdown-content">
            <ul className="dropdown-items">
              {dropdownOptions.map((e) => {
                return (
                  <li key={e.id} className="dropdown-element">
                    <div role="button" className="drp-btn-e">
                      {e.icon}
                      <label htmlFor={e.id}><h4 className="pointer">{e.name}</h4></label>
                      <input 
                        onChange={fileUpload} 
                        style={{ "display": "none" }} 
                        type="file" 
                        id={e.id} 
                        {...(e.uploadMultiple ? {multiple: true, webkitdirectory: "true"}: {})}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </button>
      </section>
      {/* ************************************************************** */}

      {/* ********************* SECTION: Nav *************************** */}
      <div>
        <ul className="selectorWrapper">
          {locations.map((element) => {
            return (
              <a key={element.id} className="selector" href="#">
                <li className={`selectorItem ${element.animation}`}>
                  <div className="selectorIcon">
                    {element.Icon}
                  </div>
                  <p className="selectorText">{element.name}</p>
                </li>
              </a>
            );
          })}
        </ul>
      </div>
      {/* ************************************************************** */}
    </div>
  );
}
