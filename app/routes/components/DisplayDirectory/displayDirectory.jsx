import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronLeft, 
  ChevronRight,
  Home,
  Sidebar,
  Grid,
  List,
  Trash,
  Download,
  Upload,
  } from 'lucide-react';
import UploadCard from './UploadCard/uploadCard';
import FolderTree from './folder-tree/folderTree';
import HandleDisplayIcons from '../HandleDisplayIcons/handleDisplayIcons';
import "./displayDirectory.css";

export default function DisplayDirectory({ 
  displayNodeId,
  setDisplayNodeId,
  fileUpload,
  childrenOfRootNode
 }) {

  // Forward and backward buttons
  const [backHistory, setBackHistory] = useState([]);
  const [forwardHistory, setForwardHistory] = useState([]);

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
    const prevNodeId = backHistory[backHistory.length - 1];
    const nextNodeId = forwardHistory[0];

    function moveBack() {
      setForwardHistory([displayNodeId, ...forwardHistory]);
      setBackHistory(backHistory.slice(0, -1));
      setDisplayNodeId(prevNodeId);
    }

    function moveForward() {
      setBackHistory([...backHistory, displayNodeId]);
      setForwardHistory(forwardHistory.slice(1));
      setDisplayNodeId(nextNodeId);
    }

    if (direction === 'backward') {
      if (prevNodeId !== undefined && prevNodeId !== null) {
        if (displayNodeId !== constructDirTree.root.id) {
          moveBack();
        }
      }
      
    } else if (direction === 'forward') {
      if (nextNodeId !== undefined) {
        moveForward();
      }
    }
  }

  const handleFolderClick = (folderId) => {
      setBackHistory([...backHistory, displayNodeId]);
      setForwardHistory([]);
      setDisplayNodeId(folderId);
  }

  // Sidebar
  const [showStateList ,setShowStateList] = useState([]);
  const [showSideBar, setShowSideBar] = useState(true);


  // Resize sidebar
  const [dimensions, setDimensions] = useState({
    width: 250,
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
          Math.max(250, prev.width + difference),
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
    setBackHistory: setBackHistory
  }

  // Upload Card
  const [displayUploadCard, setDisplayUploadCard] = useState(false);

  const handleUploadCardState = () => {
    displayUploadCard ? setDisplayUploadCard(false) : setDisplayUploadCard(true);
  }

  const uploadCardProps = { 
    handleUploadCardState: handleUploadCardState,
    fileUpload: fileUpload
  }

  // Delete button
  const [idArr, setIdArr] = useState([]);

  const handleIdArrState = (checkState, uuid) => {
    if (!checkState) {
      setIdArr([...idArr, uuid]);
    } else {
      setIdArr(idArr.filter(element => element !== uuid));
    }
  }

  const handleDeleteButton = () => {
    const ids = [];
    idArr.forEach(element => ids.push(element));
    console.log(childrenOfRootNode);
  }

  return (
    <>
      {displayUploadCard ?
        <UploadCard {...uploadCardProps} />
        : <div style={{"display": "none"}}></div> 
      }
      <div className='navWrapper prevent-select'>
        <button className='homeButton pointer' onClick={() => {
          // setDisplayNodeId(constructDirTree.root.id)
          setForwardHistory([]);
          setBackHistory([]);
          }}>
          <Home />
        </button>
        <button className='homeButton' onClick={() => 
          showSideBar
            ? setShowSideBar(false)
            : setShowSideBar(true)
          }><Sidebar />
        </button>
        <button className='homeButton circle' onClick={() => handleNavClick('backward')}>
          <ChevronLeft /> 
        </button>
        <button className='homeButton circle' onClick={() => handleNavClick('forward')}>
          <ChevronRight />
        </button>
        <div className='nav-buttons-right'>
          <button 
            onClick={() => {
              handleDeleteButton();
            }}
            className='homeButton'>
            <Trash />
          </button>
          <button className='homeButton'>
            <Download />
          </button>
          <button 
            onClick={() => {
              handleUploadCardState();
            }}
            className='homeButton'>
            <Upload />
          </button>
          <button 
            onClick={() => {
              isIcon ? setIsIcon(false) : setIsIcon(true);
            }}
            className='homeButton'>
              {isIcon
                ? <Grid />
                : <List />
              }
          </button>
        </div>
      </div>
      <div className='mainWindowWrapper prevent-select'>
        
        {showSideBar
          ? 
            <div 
              onMouseDown={handleMouseDown}
              style={{"width": `${dimensions.width}px`}}
              className='dirTreeSideBar'>
                <div className='sideItemWrapper'>
                <FolderTree {...folderTreeComponentProps}/>
                </div>
              <div className='handle'>
                <div className='handle-gui'>
                  <div className='dot'></div>
                  <div className='dot'></div>
                  <div className='dot'></div>
                </div>
              </div>
            </div> 
          :
            <div style={{"display": "none"}}>
            </div>
        }
        <div className={`width100 padding0 ${isIcon ? 'flexWrap' : ''}`}>
          <HandleDisplayIcons 
            childrenOfRootNode={childrenOfRootNode}
            isIcon={isIcon}
            handleFolderClick={handleFolderClick}
            handleIdArrState={handleIdArrState}
            getChildNodes={getChildNodes}
          />
        </div>
      </div>
    </>
  );
}
