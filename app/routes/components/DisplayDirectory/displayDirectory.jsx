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
  Upload
  } from 'lucide-react';
import File from "./File/file";
import Folder from "./Folder/folder";
import RecursiveSideItemComponent from './recursive-side-item-component/recursiveSideItemComponent';
import { DirectoryTree } from "../../../utils/DataStructures/directoryTree";
import "./displayDirectory.css";

export default function DisplayDirectory({ files }) {

  // create tree data set from db and memoize it.
  const constructDirTree = useMemo(() => {
    if (!files || files.length === 0) return null;

    const tree = new DirectoryTree();
    files.forEach(file => {
      const path = file.relitive_path;
      const type = file.file_type === 'folder' ? 'folder' : 'file';
      try {
        tree.addNodeByPath(path, type);
      } catch (error) {
        console.error(`Error adding path ${path}: ${error.message}`);
      }
    });
    return tree;
  }, [files]);

  // Setting up states and root node id
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [backHistory, setBackHistory] = useState([]);
  const [forwardHistory, setForwardHistory] = useState([]);

  useEffect(() => {
    if (constructDirTree) {
      setCurrentNodeId(constructDirTree.root.id);
    }
  }, [constructDirTree]);

  // ###########################################
  // ############## SECTION: AJAX ##############
  // ###########################################
  if (!files || files.length === 0) {
    return <h1 style={{ color: "white" }}>No Files (files is {JSON.stringify(files)})</h1>;
  }
  if (!constructDirTree) {
    return <h1 style={{ color: "white" }}>Loading...</h1>;
  }

  // ###########################################
  // ######### SECTION: get nodes ##############
  // ###########################################
  const currentNode = constructDirTree.getNodeById(currentNodeId);
  const childrenOfCurrentNode = currentNode ? currentNode.children : [];
  const rootNode = constructDirTree.root.children;
  const getChildNodes = (id) => {
    return constructDirTree.getChildNodebyCurrentNodeId(id)
  }

  // ###########################################
  // ######### SECTION: Nav buttons ############
  // ###########################################
  const handleNavClick = (direction) => {
    const prevNodeId = backHistory[backHistory.length - 1];
    const nextNodeId = forwardHistory[0];

    function moveBack() {
      setForwardHistory([currentNodeId, ...forwardHistory]);
      setBackHistory(backHistory.slice(0, -1));
      setCurrentNodeId(prevNodeId);
    }

    function moveForward() {
      setBackHistory([...backHistory, currentNodeId]);
      setForwardHistory(forwardHistory.slice(1));
      setCurrentNodeId(nextNodeId);
    }

    if (direction === 'backward') {
      if (prevNodeId !== undefined && prevNodeId !== null) {
        if (currentNodeId !== constructDirTree.root.id) {
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
      setBackHistory([...backHistory, currentNodeId]);
      setForwardHistory([]);
      setCurrentNodeId(folderId);
  }

  // ###########################################
  // ########### SECTION: Sidebar ##############
  // ###########################################

  const [showStateList ,setShowStateList] = useState([]);
  const [showSideBar, setShowSideBar] = useState(true);

  const recursiveSideItemComponentProps = {
    childrenOfCurrentNode: rootNode,
    showStateList: showStateList,
    setShowStateList: setShowStateList,
    getChildNodes: getChildNodes,
    setCurrentNodeId: setCurrentNodeId,
    currentNodeId: currentNodeId,
    setForwardHistory: setForwardHistory,
    forwardHistory: forwardHistory,
    backHistory: backHistory,
    setBackHistory, setBackHistory
  }
  
  // ##########################################
  // ########### SECTION: Resize ##############
  // ##########################################

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
          800
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

  // ##########################################
  // ########### SECTION: Icon/row ############
  // ##########################################

  const [isIcon, setIsIcon] = useState(true);

  return (
    <>
      <div className='navWrapper prevent-select'>
        <button className='homeButton' onClick={() => {
          setCurrentNodeId(constructDirTree.root.id)
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
          <button className='homeButton'>
            <Trash />
          </button>
          <button className='homeButton'>
            <Download />
          </button>
          <button className='homeButton'>
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
                <RecursiveSideItemComponent {...recursiveSideItemComponentProps}/>
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
        {isIcon
          ? 
            <div className='width100 padding0 flexWrap'>
              {childrenOfCurrentNode.map(child => 
                child.type === 'folder' ? (
                  <Folder 
                  key={child.id}
                  name={child.name}
                  id={child.id}
                  handleFolderClick={handleFolderClick}
                  isIcon={isIcon}
                  />
                ) : (
                  <File
                  key={child.id}
                  name={child.name}
                  isIcon={isIcon}
                  id={child.id}
                  />
                )
              )}
            </div>
          :
            <div className='width100 padding0'>
              {childrenOfCurrentNode.map(child => 
                child.type === 'folder' ? (
                  <Folder 
                  key={child.id}
                  name={child.name}
                  id={child.id}
                  handleFolderClick={handleFolderClick}
                  isIcon={isIcon}
                  />
                ) : (
                  <File
                  key={child.id}
                  name={child.name}
                  isIcon={isIcon}
                  id={child.id}
                  />
                )
              )}
            </div>
        }
        
      </div>
    </>
  );
}
