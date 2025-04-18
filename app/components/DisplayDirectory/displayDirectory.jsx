import React, { useState, useContext, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Home, Sidebar, Grid, List, Trash, Download, Upload } from 'lucide-react';
import { IndexContext, displayIconContext, uploadCardContext } from '../../utils/context';
import UploadCard from '../UploadCard/uploadCard';
import FolderTree from '../folder-tree/folderTree';
import HandleDisplayIcons from '../HandleDisplayIcons/handleDisplayIcons';
import "../../css/displayDirectory.css";

export default function DisplayDirectory() {
  const {
    childrenOfRootNode,
    setChildrenOfRootNode,
    fileUpload,
    displayNodeId,
    setDisplayNodeId,
    rootNodeId,
    pendingFileOperation,
    setPendingFileOperation,
  } = useContext(IndexContext);


  // TODO:
  // 1. Get websockets working with state to reload components when uploading/deleting files
  // 2. Create state context for websocket... possibly other components too

  // Logic for reloading display window after upload/delete
  const [cacheId, setCacheId] = useState(null);

  useEffect(() => { // trigger state update in depending components
  }, [pendingFileOperation]);

  // Websocket connection
  const socket = new WebSocket('ws://fileSync.home:3030');

  socket.addEventListener('open', event => {
    console.log('WebSocket connection established!');
    socket.send('Hello Server!');
    socket.send('reload_display_window');
  });

  socket.addEventListener('message', event => {
    console.log('Message from server: ', event.data);
  });

  socket.addEventListener('close', event => {
    console.log('WebSocket connection closed:', event.code, event.reason);
  });

  socket.addEventListener('error', error => {
    console.error('WebSocket error:', error);
  });

  // Forward and backward buttons
  const [backHistory, setBackHistory] = useState([]);
  const [forwardHistory, setForwardHistory] = useState([]);
  const [currentDisplayNodes, setCurrentDisplayNodes] = useState(null);

  // get nodes
  async function getChildNodes(idOfItemClicked) {
    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }, 
        body: JSON.stringify({
          displayNodeId: idOfItemClicked,
          requestType: 'get_child_nodes'
        })
      }
      const response = await fetch('/databaseApi', options)
      const body = await response.json();
      return body;
    } catch (err) {
      console.error(`error fetching child nodes: ${err}`);
    }
  }

  // Nav buttons
  const handleNavClick = (direction) => {
    const currentNodeId = currentDisplayNodes[0]?.parent_id;
    const prevNodeId = backHistory[backHistory.length - 1];
    const nextNodeId = forwardHistory[0];

    if (direction === 'backward' && prevNodeId) {
      updateDisplayNodes(prevNodeId);
      setBackHistory(prevState => prevState.slice(0, -1));
      setForwardHistory(prevState => [currentNodeId, ...prevState]);
    } 

    if (direction === 'forward' && nextNodeId) {
      updateDisplayNodes(nextNodeId);
      setForwardHistory(prevState => prevState.slice(1));
      setBackHistory(prevState => [...prevState, currentNodeId]);
    }
  }

  // Folder Nav
  const handleFolderClick = (folderId) => {
    const currentNodeId = currentDisplayNodes[0]?.parent_id;
    setForwardHistory([]);
    updateDisplayNodes(folderId);
    setBackHistory(prevState => [...prevState, currentNodeId]);
  }

  // Sidebar
  const [showStateList ,setShowStateList] = useState([]);
  const [showSideBar, setShowSideBar] = useState(true);


  // Resize sidebar
  const [dimensions, setDimensions] = useState({
    width: 300,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStateX] = useState(0)


  const lastX = useRef(0);

  function handleMouseDown(e) {
    setIsDragging(true);
    lastX.current = e.clientX;
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const difference = e.clientX - lastX.current;
      lastX.current = e.clientX;

      setDimensions(prev => ({
        ...prev,
        width: Math.min(
          Math.max(300, prev.width + difference),
          1600
        )
      }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

  }, [startX, isDragging]);


  // Display files and folders as icons/rows
  const [isIcon, setIsIcon] = useState(true);

  // Component props 
  const folderTreeComponentProps = {
     childrenOfRootNode: childrenOfRootNode,
     showStateList: showStateList,
     setShowStateList: setShowStateList,
     getChildNodes: getChildNodes,
     setDisplayNodeId: setDisplayNodeId,
     displayNodeId: displayNodeId,
     setForwardHistory: setForwardHistory,
     forwardHistory: forwardHistory,
     backHistory: backHistory,
     setBackHistory: setBackHistory,
     handleFolderClick: handleFolderClick,
     pendingFileOperation: pendingFileOperation,
     setPendingFileOperation: setPendingFileOperation,
  };

  const [displayUploadCard, setDisplayUploadCard] = useState(false);

  const handleUploadCardState = () => {
    displayUploadCard ? setDisplayUploadCard(false) : setDisplayUploadCard(true);
  }

  const uploadCardProps = { 
    handleUploadCardState,
    fileUpload,
    displayNodeId,
    handleUploadCardState,
    cacheId, 
    setCacheId,
    setPendingFileOperation,
    pendingFileOperation
  }

  // Deleting items
  const [deleteQueue, setDeleteQueue] = useState([]);

  const handleDeleteQueue = (checkState, metadataObject) => {
    if (!checkState) {
      setDeleteQueue([...deleteQueue, metadataObject]);
    } else {
      setDeleteQueue(deleteQueue.filter(element => element.id !== metadataObject.id));
    }
  }

  const handleDeleteButton = async () => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify(deleteQueue)
    }

    fetch('fileDelete', options)
    .then(response => {
      if (response.status !== 200) console.log(`Response: ${response.status}`);
    })
    .catch(error => console.error(`Error deleting files: ${error}`));
  }

  // Updating display icon nodes
  const updateDisplayNodes = async (id) => {
    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }, 
        body: JSON.stringify({
          displayNodeId: id,
          requestType: 'get_child_nodes'
        })
      }
      const response = await fetch('/databaseApi', options)
      const body = await response.json();
      setCurrentDisplayNodes(body[0].children);
    } catch (err) {
      console.error(`error updating nodes for currentDisplayNodes ${err}`);
    }
  }

  const handleDisplayIconsProps = {
    updateDisplayNodes,
    currentDisplayNodes,
    setCurrentDisplayNodes,
    childrenOfRootNode,
    isIcon,
    handleFolderClick,
    handleDeleteQueue,
    getChildNodes,
    pendingFileOperation,
    setPendingFileOperation,
  };

  return (
    <>
      {displayUploadCard ? (
        <uploadCardContext.Provider value={uploadCardProps}>
          <UploadCard />
        </uploadCardContext.Provider>
      ) : (
        <div style={{ display: "none" }}></div>
      )}
      <div className="navWrapper prevent-select">
        <button
          className="homeButton pointer"
          onClick={() => {
            setCurrentDisplayNodes(childrenOfRootNode);
            setForwardHistory([]);
            setBackHistory([]);
          }}
        >
          <Home />
        </button>
        <button
          className="homeButton"
          onClick={() =>
            showSideBar ? setShowSideBar(false) : setShowSideBar(true)
          }
        >
          <Sidebar />
        </button>
        <button
          className="homeButton circle"
          onClick={() => handleNavClick("backward")}
        >
          <ChevronLeft />
        </button>
        <button
          className="homeButton circle"
          onClick={() => handleNavClick("forward")}
        >
          <ChevronRight />
        </button>
        <div className="nav-buttons-right">
          <button
            onClick={() => {
              handleDeleteButton();
            }}
            className="homeButton"
          >
            <Trash />
          </button>
          <button className="homeButton">
            <Download />
          </button>
          <button
            onClick={() => {
              handleUploadCardState();
            }}
            className="homeButton"
          >
            <Upload />
          </button>
          <button
            onClick={() => {
              isIcon ? setIsIcon(false) : setIsIcon(true);
            }}
            className="homeButton"
          >
            {isIcon ? <Grid /> : <List />}
          </button>
        </div>
      </div>
      <div className="mainWindowWrapper prevent-select">
        {showSideBar ? (
          <div
            onMouseDown={handleMouseDown}
            style={{ width: `${dimensions.width}px` }}
            className="dirTreeSideBar"
          >
            <div className="sideItemWrapper">
              <FolderTree {...folderTreeComponentProps} />
            </div>
            <div className="handle">
              <div className="handle-gui">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "none" }}></div>
        )}
        <div
          className={`${
            isIcon ? "gridIconDisplayWrapper" : "listIconDisplayWrapper"
          }`}
        >
          <displayIconContext.Provider value={handleDisplayIconsProps}>
            <HandleDisplayIcons />
          </displayIconContext.Provider>
        </div>
      </div>
    </>
  );
}
