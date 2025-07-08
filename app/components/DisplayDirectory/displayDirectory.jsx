import React, { useState, useContext, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Home, Sidebar, Grid, List, Trash, Download, Upload, RefreshCcwIcon } from 'lucide-react';
import { DisplayDirectoryContext, IndexContext, displayIconContext } from '../../utils/context';
import UploadCard from '../UploadCard/uploadCard';
import FolderTree from '../folder-tree/folderTree';
import HandleDisplayIcons from '../HandleDisplayIcons/handleDisplayIcons';
import "../../css/displayDirectory.css";

export default function DisplayDirectory() {
  const {
    rootNodeId,
    childrenOfRootNode,
    displayNodeId,
    setDisplayNodeId,
    pendingFileOperation,
    setPendingFileOperation,
    reloadTrigger,
    setReloadTrigger
  } = useContext(IndexContext);

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

  // Folder Tree Component props 
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
      body: JSON.stringify({
        deleteQueue: deleteQueue, 
        displayNodeId: displayNodeId
      })
    }

    fetch('fileDelete', options)
    .then(response => {
      if (response.ok) {
        console.log("File successfully deleted");
        setPendingFileOperation(true);
        setReloadTrigger(prev => prev + 1);
      } else {
        console.log(`Failed to delete file with status: ${response.status}`);
        setReloadTrigger(prev => prev + 1);
      }
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

  useEffect(() => {
    if (displayNodeId) {
      updateDisplayNodes(displayNodeId);
    } else {
      updateDisplayNodes(rootNodeId)
    }
    setPendingFileOperation(false);
  }, [displayNodeId, reloadTrigger]);

  const displayDirectoryContextProps = {
    updateDisplayNodes,
    currentDisplayNodes,
    setCurrentDisplayNodes,
    isIcon,
    handleFolderClick,
    handleDeleteQueue,
    getChildNodes,
    handleUploadCardState,
  };

  // MAPPED OBJECTS FOR REPEATING HTML ELEMENTS

  // Left navigation buttons configuration
  const leftNavButtons = [
    {
      id: 'home',
      icon: Home,
      className: 'homeButton pointer',
      onClick: () => {
        setCurrentDisplayNodes(childrenOfRootNode);
        setForwardHistory([]);
        setBackHistory([]);
      }
    },
    {
      id: 'sidebar',
      icon: Sidebar,
      className: 'homeButton',
      onClick: () => showSideBar ? setShowSideBar(false) : setShowSideBar(true)
    },
    {
      id: 'backward',
      icon: ChevronLeft,
      className: 'homeButton circle',
      onClick: () => handleNavClick("backward")
    },
    {
      id: 'forward',
      icon: ChevronRight,
      className: 'homeButton circle',
      onClick: () => handleNavClick("forward")
    }
  ];

  // Right navigation buttons configuration
  const rightNavButtons = [
    {
      id: 'delete',
      icon: Trash,
      className: 'homeButton',
      onClick: handleDeleteButton
    },
    {
      id: 'download',
      icon: Download,
      className: 'homeButton',
      onClick: () => {} // Add download functionality
    },
    {
      id: 'upload',
      icon: Upload,
      className: 'homeButton',
      onClick: handleUploadCardState
    },
    {
      id: 'view-toggle',
      icon: isIcon ? Grid : List,
      className: 'homeButton',
      onClick: () => isIcon ? setIsIcon(false) : setIsIcon(true)
    }
  ];

  // Handle dots for resize handle
  const handleDots = Array.from({ length: 3 }, (_, i) => ({ id: `dot-${i}` }));

  // Render button helper function
  const renderButton = (buttonConfig) => {
    const IconComponent = buttonConfig.icon;
    return (
      <button
        key={buttonConfig.id}
        className={buttonConfig.className}
        onClick={buttonConfig.onClick}
      >
        <IconComponent />
      </button>
    );
  };

  return (
    <>
      {displayUploadCard ? (
        <DisplayDirectoryContext.Provider value={displayDirectoryContextProps}>
          <UploadCard />
        </DisplayDirectoryContext.Provider>
      ) : (
        <div style={{ display: "none" }}></div>
      )}
      
      <div className="navWrapper prevent-select">
        {/* Left navigation buttons */}
        {leftNavButtons.map(renderButton)}
        
        {/* Right navigation buttons */}
        <div className="nav-buttons-right">
          {rightNavButtons.map(renderButton)}
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
                {handleDots.map(dot => (
                  <div key={dot.id} className="dot"></div>
                ))}
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
          <DisplayDirectoryContext.Provider value={displayDirectoryContextProps}>
            <HandleDisplayIcons />
          </DisplayDirectoryContext.Provider>
        </div>
      </div>
    </>
  );
}