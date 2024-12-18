import { useNavigate } from "@remix-run/react";

import "./sidebar.css";
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
  const routeHome = () =>  navigate("/");

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
                <BookmarkPlusIcon style={{"margin": "0.5rem"}} />
                <p>New</p>
            </div>
            <div className="dropdown-content">
              <ul className="dropdown-items">
                <li className="dropdown-element">
                  <div role="button" className="drp-btn-e">
                    <FileUpIcon className="dropdownIcon" />
                    <label htmlFor="uploadFile"><h4 className="pointer">Upload File</h4></label>
                    <input onChange={fileUpload} style={{"display": "none"}} type="file"  id="uploadFile" />
                  </div>
                </li>
                <li className="dropdown-element">
                  <div role="button" className="drp-btn-e">
                    <FolderUpIcon className="dropdownIcon" /> 
                    <label htmlFor="uploadFolder"><h4 className="pointer">Upload Folder</h4></label>
                    <input style={{"display": "none"}} onChange={fileUpload} type="file" multiple={true} webkitdirectory="true" id="uploadFolder" />
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
          <a className="selector" href="#">
            <li className="selectorItem animate25s">
              <Monitor className="selectorIcon" />
              <p className="selectorText">Computers</p>
            </li>
          </a>
          <a className="selector" href="#">
            <li className="selectorItem animate2s">
              <FolderIcon className="selectorIcon" />
              <p className="selectorText">Files</p>
            </li>
          </a>
          <a className="selector" href="#">
            <li className="selectorItem animate15s">
              <ImageIcon className="selectorIcon" />
              <p className="selectorText">Photos</p>
            </li>
          </a>
          <a className="selector" href="#">
            <li className="selectorItem animate1s">
              <Trash2 className="selectorIcon" />
              <p className="selectorText">Trash</p>
            </li>
          </a>
        </ul>
      </div>
      {/* ************************************************************** */}
    </div>
  );
}
