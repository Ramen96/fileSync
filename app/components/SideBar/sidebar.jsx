import { useNavigate } from "@remix-run/react";

import "./sidebar.css";
const folderIcon = "../assets/folder.svg";
const plusIcon  = "../assets/plus.svg";
const computerIcon = "../assets/computer.svg";
const folderIcon2 = "../assets/folder2.svg";
const photosIcon = "../assets/photo.svg";
const trashIcon = "../assets/trash.svg";
const fileIcon = "../assets/file.svg"

export default function SideBar() {
  const navigate = useNavigate();
  const routeHome = () =>  navigate("/");

  // This was a test to see if file uploads were being handled correctly.
  // Will come back to this later to handle saving these to the cloud.
  const filesUploaded = [];

  function fileUpload(event) {

    function sanitizePath() {
      const isTraversal = /(\.\.\/|\/\.\.)/g;
      const fileList = filesUploaded[0];

      for (let i = 0; i < fileList.length; i++) {
        const relitivePath = fileList[i].webkitRelativePath;
        const traversalTrue = [...relitivePath.matchAll(isTraversal)]; 
        console.log(traversalTrue)
        if (traversalTrue != []) {
          throw new Error("Path traversal blocked")
        } 
        console.log("relitive path: ", relitivePath);
      }
    }

    const file = event.target.files;
    filesUploaded.push(file);
    sanitizePath();
  }

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
                <img className="plusButtonSvg" src={plusIcon} alt="plus icon" />
                <p>New</p>
            </div>
            <div className="dropdown-content">
              <ul className="dropdown-items">
                <li className="dropdown-element">
                  <div role="button" className="drp-btn-e">
                    <img className="dropdownIcon" src={fileIcon} alt="file icon" />
                    <label htmlFor="uploadFile"><h4 className="pointer">Upload File</h4></label>
                    <input onChange={fileUpload} style={{"display": "none"}} type="file"  id="uploadFile" />
                  </div>
                </li>
                <li className="dropdown-element">
                  <div role="button" className="drp-btn-e">
                    <img className="dropdownIcon" src={folderIcon2} alt="file icon" />
                    <label htmlFor="uploadFolder"><h4 className="pointer">Upload Folder</h4></label>
                    <input style={{"display": "none"}} onChange={fileUpload} type="file" multiple={true} webkitdirectory="true" id="uploadFolder" />
                  </div>
                </li>
                <div className="spacer"></div>
                <li className="dropdown-element">
                  <div role="button" className="drp-btn-e">
                    <img className="dropdownIcon" src={folderIcon2} alt="file icon" />
                    <h4>New Folder</h4>
                  </div>
                </li>
                <li className="dropdown-element">
                  <div role="button" className="drp-btn-e">
                    <img className="dropdownIcon" src={fileIcon} alt="file icon" />
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
          <button onClick={ () => {
            fetch("/fileStorage", {
              method: "POST"
            })
              .then(res => res.json())
              .then(data => console.log("data: ", data))
          }} className="selector">
            <h1>Click me</h1>
          </button>
        </ul>
      </div>
      {/* ************************************************************** */}
    </div>
  );
}
