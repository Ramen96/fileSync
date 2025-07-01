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
              <li className="dropdown-element">
                <div role="button" className="drp-btn-e">
                  <FileUpIcon className="dropdownIcon" />
                  <label htmlFor="uploadFile"><h4 className="pointer">Upload File</h4></label>
                  <input onChange={fileUpload} style={{ "display": "none" }} type="file" id="uploadFile" />
                </div>
              </li>
              <li className="dropdown-element">
                <div role="button" className="drp-btn-e">
                  <FolderUpIcon className="dropdownIcon" />
                  <label htmlFor="uploadFolder"><h4 className="pointer">Upload Folder</h4></label>
                  <input style={{ "display": "none" }} onChange={fileUpload} type="file" multiple={true} webkitdirectory="true" id="uploadFolder" />
                </div>
              </li>
              <div className="spacer"></div>
              <li className="dropdown-element">
                <div role="button" className="drp-btn-e">
                  <FolderPlus className="dropdownIcon" />
                  <h4>New Folder</h4>
                </div>
              </li>
              <li className="dropdown-element">
                <div role="button" className="drp-btn-e">
                  <FilePlus className="dropdownIcon" />
                  <h4>New Document</h4>
                </div>
              </li>
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
