import { useNavigate } from "@remix-run/react";

import "./sidebar.css";
const folderIcon = "../assets/folder.svg";
const plusIcon  = "../assets/plus.svg";
const computerIcon = "../assets/computer.svg";
const folderIcon2 = "../assets/folder2.svg";
const photosIcon = "../assets/photo.svg";
const trashIcon = "../assets/trash.svg";

export default function SideBar() {
  const navigate = useNavigate();
  const routeHome = () =>  navigate("/");
  return (
    <div className="sidebar">
      <button onClick={routeHome} className="logo animate35s">
        <img className="folderIcon" src={folderIcon} alt="folder icon"></img>
        <h1>FileSync</h1>
      </button>
      <section className="nbWrapper">
          <button className="newButton animate3s dropdown">
              <div className="centerSVG">
                <img className="plusButtonSvg" src={plusIcon} alt="plus icon" />
                <p>New</p>
            </div>
            <div className="dropdown-content">
              <ul className="dropdown-items">
                <li className="dropdown-element">
                  <button className="drp-btn-e">
                    Upload File
                  </button>
                </li>
                <li className="dropdown-element">
                  <button className="drp-btn-e">
                    Upload Folder
                  </button>
                </li>
                <li className="dropdown-element">
                  <button className="drp-btn-e">
                    New Folder
                  </button>
                </li>
                <li className="dropdown-element">
                  <button className="drp-btn-e">
                    New Document
                  </button>
                </li>
              </ul>
            </div>
          </button>
      </section>
      <div>
        <ul className="selectorWrapper">
          <a className="selector" href="#">
            <li className="selectorItem animate25s">
              <img className="selectorIcon" src={computerIcon} alt="computer" />
              <p className="selectorText">Computers</p>
            </li>
          </a>
          <a className="selector" href="#">
            <li className="selectorItem animate2s">
              <img className="selectorIcon" src={folderIcon2} alt="folder icon" />
              <p className="selectorText">Files</p>
            </li>
          </a>
          <a className="selector" href="#">
            <li className="selectorItem animate15s">
              <img className="selectorIcon" src={photosIcon} alt="photos icon" />
              <p className="selectorText">Photos</p>
            </li>
          </a>
          <a className="selector" href="#">
            <li className="selectorItem animate1s">
              <img className="selectorIcon" src={trashIcon} alt="trash icon" />
              <p className="selectorText">Trash</p>
            </li>
          </a>
        </ul>
      </div>
    </div>
  );
}
