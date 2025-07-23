import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Home, Sidebar, Grid, List, Trash, Download, Upload, MousePointerClick, RefreshCcwIcon } from 'lucide-react';
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
    setPendingFileOperation,
    reloadTrigger,
    setReloadTrigger
  } = useContext(IndexContext);

  const [backHistory, setBackHistory] = useState([]);
  const [forwardHistory, setForwardHistory] = useState([]);
  const [currentDisplayNodes, setCurrentDisplayNodes] = useState(null);

  const currentDisplayNodesRef = useRef(null);
  const displayNodeIdRef = useRef(displayNodeId);
  const backHistoryRef = useRef(backHistory);
  const forwardHistoryRef = useRef(forwardHistory);

  const [selectState, setSelectState] = useState(false);

  useEffect(() => {
    currentDisplayNodesRef.current = currentDisplayNodes;
  }, [currentDisplayNodes]);

  useEffect(() => {
    displayNodeIdRef.current = displayNodeId;
  }, [displayNodeId]);

  useEffect(() => {
    backHistoryRef.current = backHistory;
  }, [backHistory]);

  useEffect(() => {
    forwardHistoryRef.current = forwardHistory;
  }, [forwardHistory]);

  // Memoized API call for getting child nodes
  const getChildNodes = useCallback(async (idOfItemClicked) => {
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
      const response = await fetch('/databaseApi', options);
      const body = await response.json();
      return body;
    } catch (err) {
      console.error(`error fetching child nodes: ${err}`);
      return [];
    }
  }, []);

  // Memoized display nodes update
  const updateDisplayNodes = useCallback(async (id) => {
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
      const response = await fetch('/databaseApi', options);
      const body = await response.json();
      setCurrentDisplayNodes(body[0]?.children || []);
    } catch (err) {
      console.error(`error updating nodes for currentDisplayNodes ${err}`);
    }
  }, []);

  const handleNavClick = useCallback((direction) => {
    const currentNodes = currentDisplayNodesRef.current;
    const currentNodeId = currentNodes?.[0]?.parent_id;
    const prevNodeId = backHistoryRef.current[backHistoryRef.current.length - 1];
    const nextNodeId = forwardHistoryRef.current[0];

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
  }, [updateDisplayNodes]);

  const handleFolderClick = useCallback((folderId) => {
    const currentNodes = currentDisplayNodesRef.current;
    const currentNodeId = currentNodes?.[0]?.parent_id;
    setForwardHistory([]);
    updateDisplayNodes(folderId);
    setBackHistory(prevState => [...prevState, currentNodeId]);
  }, [updateDisplayNodes]);

  // Sidebar
  const [showStateList, setShowStateList] = useState([]);
  const [showSideBar, setShowSideBar] = useState(true);

  // Resize sidebar
  const [dimensions, setDimensions] = useState({
    width: 300,
  });

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const lastX = useRef(0);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    lastX.current = e.clientX;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;

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
  }, [isDragging]);

  // Display files and folders as icons/rows
  const [isIcon, setIsIcon] = useState(true);

  const [displayUploadCard, setDisplayUploadCard] = useState(false);

  const handleUploadCardState = useCallback(() => {
    setDisplayUploadCard(prev => !prev);
  }, []);

  // Deleting items
  const [deleteQueue, setDeleteQueue] = useState([]);

  const handleDeleteQueue = useCallback((checkState, metadataObject) => {
    if (!checkState) {
      setDeleteQueue(prev => [...prev, metadataObject]);
    } else {
      setDeleteQueue(prev => prev.filter(element => element.id !== metadataObject.id));
    }
  }, []);

  const handleDeleteButton = useCallback(async () => {
    const currentDisplayNodeId = displayNodeIdRef.current;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        deleteQueue: deleteQueue,
        displayNodeId: currentDisplayNodeId
      })
    }

    try {
      const response = await fetch('fileDelete', options);
      if (response.ok) {
        console.log("File successfully deleted");
        setPendingFileOperation(true);
        setReloadTrigger(prev => prev + 1);
      } else {
        console.log(`Failed to delete file with status: ${response.status}`);
        setReloadTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error(`Error deleting files: ${error}`);
    }
  }, [deleteQueue, setPendingFileOperation, setReloadTrigger]);

  useEffect(() => {
    const nodeIdToUpdate = displayNodeId || rootNodeId;
    if (nodeIdToUpdate) {
      updateDisplayNodes(nodeIdToUpdate);
    }

    if (reloadTrigger > 0) {
      const timer = setTimeout(() => {
        setPendingFileOperation(false);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setPendingFileOperation(false);
    }
  }, [displayNodeId, reloadTrigger, rootNodeId, updateDisplayNodes, setPendingFileOperation]);

  const folderTreeComponentProps = {
    childrenOfRootNode,
    getChildNodes,
    handleFolderClick
  };

  const displayDirectoryContextProps = {
    updateDisplayNodes,
    currentDisplayNodes,
    setCurrentDisplayNodes,
    isIcon,
    handleFolderClick,
    handleDeleteQueue,
    getChildNodes,
    handleUploadCardState,
    selectState 
  };

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
      onClick: () => setShowSideBar(prev => !prev)
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

  const rightNavButtons = [
    {
      id: 'select',
      icon: MousePointerClick,
      className: selectState ? 'homeButton homeButton-selected' : 'homeButton',
      onClick: () => { setSelectState(!selectState) }
    },
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
      onClick: () => { }
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
      onClick: () => setIsIcon(prev => !prev)
    }
  ];

  const handleDots = Array.from({ length: 3 }, (_, i) => ({ id: `dot-${i}` }));

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
        <div className="nav-buttons-left">
          {leftNavButtons.map(renderButton)}
        </div>
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
          className={`${isIcon ? "gridIconDisplayWrapper" : "listIconDisplayWrapper"
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