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
  const rootNodeId = db.id;

  const socket = useContext(wsContext);

  // Logic for reloading display window after upload/delete
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    setChildrenOfRootNode(childrenOfRoot);
    setDisplayNodeId(rootNodeId);
  }, [childrenOfRoot, rootNodeId]);

  // WebSocket connection with cleanup
  useEffect(() => {
    if (!socket) return;

    const handleOpen = (event) => {
      console.log('WebSocket connection established!');
      socket.send(JSON.stringify({ action: 'connection', message: 'Hello Server!' }));
    };

    const handleMessage = (event) => {
      const msgObject = JSON.parse(event.data);
      console.log('WebSocket message received:', event.data);
      if (msgObject?.message === 'reload') {
        setDisplayNodeId(msgObject.id);
        setReloadTrigger(prev => prev + 1);
      } else if (msgObject.message === false) {
        console.log('message: ', msgObject.message);
      }
    };

    const handleClose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
    };

    const handleError = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.addEventListener('open', handleOpen);
    socket.addEventListener('message', handleMessage);
    socket.addEventListener('close', handleClose);
    socket.addEventListener('error', handleError);

    return () => {
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('close', handleClose);
      socket.removeEventListener('error', handleError);
    };
  }, [socket]);

  function fileUpload(event) {
    // Ensure we have a valid displayNodeId before proceeding
    if (!displayNodeId) {
      console.error('No display node ID available for upload');
      return;
    }

    setPendingFileOperation(true);

    const files = event.target.files;
    if (!files || files.length === 0) {
      setPendingFileOperation(false);
      return;
    }

    const fileList = new FormData();

    for (let i = 0; i < files.length; i++) {
      fileList.append(files[i].name, files[i]);
    }

    const metadata = () => {
      const dataArr = [];
      for (let i = 0; i < files.length; i++) {
        const fileObject = files[i];
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
      return dataArr;
    };

    fileList.append('metadata', JSON.stringify(metadata()));

    fetch("fileStorage", {
      method: "POST",
      body: fileList
    })
      .then((res) => {
        if (res.ok) {
          console.log("Upload successful");
        } else {
          console.log(`Upload failed with status: ${res.status}`);
        }
        setPendingFileOperation(false);
        setReloadTrigger(prev => prev + 1);
      })
      .catch((err) => {
        console.error(err);
        setPendingFileOperation(false);
      });
  }

  const indexContextProps = {
    childrenOfRootNode,
    setChildrenOfRootNode,
    fileUpload,
    displayNodeId,
    setDisplayNodeId,
    rootNodeId,
    pendingFileOperation,
    setPendingFileOperation,
    reloadTrigger,
    setReloadTrigger
  };

  const sidebarProps = {
    fileUpload: fileUpload,
    displayNodeId: displayNodeId // Fixed prop name
  };

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