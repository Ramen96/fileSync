import { data } from "react-router";
import { useLoaderData } from "react-router";
import { useEffect, useState, useContext, useRef, useCallback } from "react";
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
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const db = useLoaderData();
  const childrenOfRoot = db.children;
  const rootNodeId = db.id;

  const socket = useContext(wsContext);

  const displayNodeIdRef = useRef(displayNodeId);
  const pendingFileOperationRef = useRef(pendingFileOperation);
  const reloadTriggerRef = useRef(reloadTrigger);

  useEffect(() => {
    displayNodeIdRef.current = displayNodeId;
  }, [displayNodeId]);

  useEffect(() => {
    pendingFileOperationRef.current = pendingFileOperation;
  }, [pendingFileOperation]);

  useEffect(() => {
    reloadTriggerRef.current = reloadTrigger;
  }, [reloadTrigger]);

  useEffect(() => {
    setChildrenOfRootNode(childrenOfRoot);
    setDisplayNodeId(rootNodeId);
  }, [childrenOfRoot, rootNodeId]);

const handleWebSocketMessage = useCallback((event) => {
  try {
    const msgObject = JSON.parse(event.data);
    console.log('WebSocket message received:', event.data);
    if (msgObject?.message === 'reload') {
      setPendingFileOperation(true);
      setDisplayNodeId(msgObject.id);
      setReloadTrigger(prev => prev + 1);
      setTimeout(() => {
        setPendingFileOperation(false);
      }, 500);
    } else if (msgObject.message === false) {
      console.log('message: ', msgObject.message);
      setPendingFileOperation(false);
    }
  } catch (error) {
    console.error('Error parsing WebSocket message:', error);
    setPendingFileOperation(false);
  }
}, []);
  // const handleWebSocketMessage = useCallback((event) => {
  //   try {
  //     const msgObject = JSON.parse(event.data);
  //     console.log('WebSocket message received:', event.data);
      
  //     if (msgObject?.message === 'reload') {
  //       setDisplayNodeId(msgObject.id);
  //       setReloadTrigger(prev => prev + 1);
  //     } else if (msgObject.message === false) {
  //       console.log('message: ', msgObject.message);
  //     }
  //   } catch (error) {
  //     console.error('Error parsing WebSocket message:', error);
  //   }
  // }, []);

  const handleWebSocketOpen = useCallback((event) => {
    console.log('WebSocket connection established!');
    if (socket) {
      socket.send(JSON.stringify({ action: 'connection', message: 'Hello Server!' }));
    }
  }, [socket]);

  const handleWebSocketClose = useCallback((event) => {
    console.log('WebSocket connection closed:', event.code, event.reason);
  }, []);

  const handleWebSocketError = useCallback((error) => {
    console.error('WebSocket error:', error);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.addEventListener('open', handleWebSocketOpen);
    socket.addEventListener('message', handleWebSocketMessage);
    socket.addEventListener('close', handleWebSocketClose);
    socket.addEventListener('error', handleWebSocketError);

    return () => {
      socket.removeEventListener('open', handleWebSocketOpen);
      socket.removeEventListener('message', handleWebSocketMessage);
      socket.removeEventListener('close', handleWebSocketClose);
      socket.removeEventListener('error', handleWebSocketError);
    };
  }, [socket, handleWebSocketOpen, handleWebSocketMessage, handleWebSocketClose, handleWebSocketError]);

  const fileUpload = useCallback((event) => {
    const currentDisplayNodeId = displayNodeIdRef.current;
    if (!currentDisplayNodeId) {
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
          parent_id: currentDisplayNodeId,
        };

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
  }, []);

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
    displayNodeId: displayNodeId
  };

  return (
    <>
      <SideBar {...sidebarProps} />
      <div className="main">
        <div className="searchBarWrapper flex-jc-ai main-bg">
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