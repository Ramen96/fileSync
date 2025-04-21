import { data } from "react-router";
import { useLoaderData } from "react-router";
import { useEffect, useState, useContext } from "react";
import { IndexContext, wsContext } from "../utils/context.js";
import { prisma } from "../utils/prisma.server.js";
import SideBar from "../components/SideBar/sidebar.jsx";
import DisplayDirectory from "../components/DisplayDirectory/displayDirectory.jsx";
const searchIcon = "../assets/search.svg";
import "../css/index.css";

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


  const socket = useContext(wsContext);

  // Logic for reloading display window after upload/delete
  const [reloadTrigger, setReloadTrigger] = useState(0);
 


  // Websocket connection
  socket.addEventListener('open', event => {
    console.log('WebSocket connection established!');
    socket.send(JSON.stringify({ action: 'connection', message: 'Hello Server!'}));
  });

  socket.addEventListener('message', event => {
    const msgObject = JSON.parse(event.data);
    console.log('WebSocket message received:', event.data);
    if (msgObject?.message === 'reload') {
      setDisplayNodeId(msgObject.id);
      setReloadTrigger(prev => prev + 1);

    } else if (msgObject.message === false) {
      console.log('message: ', msgObject.message);
    }
  });

  socket.addEventListener('close', event => {
    console.log('WebSocket connection closed:', event.code, event.reason);
  });

  socket.addEventListener('error', error => {
    console.error('WebSocket error:', error);
  });

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
    .then((res) => {
      if (res.status !== 200) {
        console.log(`Response: ${res.status}`);
        setPendingFileOperation(false);
      }
    })
    .catch((err) => {
      console.error(err);
      setPendingFileOperation(false);
    });
  };

const indexContextProps = {
    childrenOfRootNode, 
    setChildrenOfRootNode, 
    fileUpload, 
    displayNodeId, 
    setDisplayNodeId, 
    rootNodeId, 
    pendingFileOperation, 
    setPendingFileOperation,
    // wsTriggerReload,
    reloadTrigger 
  }

  const sidebarProps = {
    fileUpload: fileUpload,
    displayNodeId: displayNodeId
  }

  return (
    <>
      <SideBar {...sidebarProps} />
      <div className="main">
        <div className="searchBarWrapper flex-jc-ai  main-bg">
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
          <IndexContext.Provider value={indexContextProps}>
            <DisplayDirectory />
          </IndexContext.Provider>
        </div>
      </div>
    </>
  );
}
