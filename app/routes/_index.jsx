import { data } from "react-router";
import { useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import "../css/index.css";
import SideBar from "../components/SideBar/sidebar.jsx";
import DisplayDirectory from "../components/DisplayDirectory/displayDirectory.jsx";
import { prisma } from "../utils/prisma.server.js";
import { IndexContext } from "../utils/context.js";
const searchIcon = "../assets/search.svg";

export async function loader() {
  try {
    const initRoot = await prisma.hierarchy.findFirst({
      where: {
        parent_id: null,
      }, 
      include: {
        metadata: true,
        children: {
          include: {
            metadata: true,
          }
        }
      }
    });

    return data(initRoot);
  } catch (error) {
    console.error("Error fetching data:", error);
    return data({}, { status: 500 });
  }
}

export default function Index() {
  const [displayNodeId, setDisplayNodeId] = useState(null);
  const [childrenOfRootNode, setChildrenOfRootNode] = useState(null);
  const [pendingFileOperation, setPendingFileOperation] = useState(false);

  const db = useLoaderData();

  const childrenOfRoot = db.children;
  const rootNodeId = db.id

  useEffect(() => {
    setChildrenOfRootNode(childrenOfRoot);
    setDisplayNodeId(rootNodeId);
  }, []);

  function fileUpload(input) {
    const file = input instanceof Event ? input.target.files : input;
    const fileList = new FormData();

    for (let i = 0; i < file.length; i++) {
      fileList.append(file[i].name, file[i]);
    }

    const metadata = () => {
      const dataArr = [];
      for (let i in file) {
        if (file[i] instanceof File) {
          const fileObject = file[i];
          console.log('item in fileObject', fileObject);

          const fileInfo = {
            parent_id: displayNodeId,  
          };

          // determine if it is a folder or file and parse path on backend to create nodes in db for each file.
          if (fileObject.webkitRelativePath.length === 0) {
            fileInfo.is_folder = false;
          } else if (fileObject.webkitRelativePath.length > 0) {
            fileInfo.is_folder = true;
          }

          fileInfo.name = fileObject.name;
          fileInfo.webkitRelativePath = fileObject.webkitRelativePath;
          fileInfo.type = fileObject.type;
          dataArr.push(fileInfo);
        }
      }
      return dataArr;
    }

    
    fileList.append('metadata', JSON.stringify(metadata()));
    fetch("fileStorage", {
      method: "POST",
      body : fileList
    })
    .then(res => {
      res.status === 200 ?
        setPendingFileOperation(!pendingFileOperation)
      : console.log(`Response: ${res.status}`)
    })
    .catch(err => console.error(err));
  }

const DisplayDirectoryProps = {
    childrenOfRootNode, 
    setChildrenOfRootNode, 
    fileUpload, 
    displayNodeId, 
    setDisplayNodeId, 
    rootNodeId, 
    pendingFileOperation, 
    setPendingFileOperation 
  }

  const sidebarProps = {
    fileUpload: fileUpload,
    displayNodeId: displayNodeId
  }

  return (
    <>
      <SideBar {...sidebarProps} />
      <div className="main">
        <div className="searchbarwrapper flex-jc-ai  main-bg">
          <button className="submitButton">
            <img className="searchIcon" src={searchIcon} alt="search icon" />
          </button>
          <input
            className="searchBar"
            id="searchbar"
            type="text"
            placeholder="Search drive"
          />
        </div>
        <div className="mainWindow main-bg">
          <IndexContext.Provider value={DisplayDirectoryProps}>
            <DisplayDirectory />
          </IndexContext.Provider>
        </div>
      </div>
    </>
  );
}
