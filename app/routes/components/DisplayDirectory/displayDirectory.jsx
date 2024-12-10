import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DirectoryTree } from "../../../utils/DataStructures/directoryTree";
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
import File from "./File/file";
import Folder from "./Folder/folder";
import RecursiveSideItemComponent from './recursive-side-item-component/recursiveSideItemComponent';
import "./displayDirectory.css";

export default function DisplayDirectory({hierarchy, metadata }) {
  // ###########################################
  // #### SECTION: Create  data structure ######
  // ###########################################

  // create tree data set from db and memoize it.
  // const constructDirTree = useMemo(() => {
  //   if (!files || files.length === 0) return null;

  //   const tree = new DirectoryTree();

    // Problem: The db has no ids for folders only files. Folders are represented by strings for the relitive path 
    // Why this is a problem: A method is needed to be able to delete files/folders and create/delete empty folders. 
    
    // Solution:
    // 1. Created hierarchy and meta data tables
    // -- Heiarchy holds key and value pairs for node ids and their parrent id.
    // -- Metadata, self explanitory holds meta data along with it's id.

    // 2. Create hash table from hierarchy and metadata tables...

  //   for (let i = 0; i < files.length; i++) {
  //     // const dbId = files[i].id;
  //     const path = files[i].relitive_path;
  //     const type = files[i].file_type === 'folder' ? 'folder' : 'file';

  //     try {
  //       tree.addNodeByPath(path, type)
  //     } catch (error) {
  //       console.error(`Error adding path ${path}: ${error.message}`);
  //     }
  //   }
  //   return tree;
  // }, [files]);

  // Setting up states and root node id
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [backHistory, setBackHistory] = useState([]);
  const [forwardHistory, setForwardHistory] = useState([]);

  // useEffect(() => {
  //   if (constructDirTree) {
  //     setCurrentNodeId(constructDirTree.root.id);
  //   }
  // }, [constructDirTree]);

  // ###########################################
  // ############## SECTION: AJAX ##############
  // ###########################################

  if (!metadata || metadata.length === 0) {
    return <h1 style={{ color: "white" }}>Error no file data... {JSON.stringify(metadata)}</h1>;
  }

  if (!hierarchy || hierarchy.length === 0) {
    return <h1 style={{ color: "white" }}>Error no file hierarchy... {JSON.stringify(hierarchy)}</h1>;
  }

  // if (!constructDirTree) {
  //   return <h1 style={{ color: "white" }}>Loading...</h1>;
  // }

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

  // ##########################################
  // ########### SECTION: Icon/row ############
  // ##########################################
  const [isIcon, setIsIcon] = useState(true);

  // ###########################################
  // ####### SECTION: Component props ##########
  // ###########################################

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
    setBackHistory: setBackHistory
  }


  // ###########################################
  // ######### SECTION: Upload Card ############
  // ###########################################
  const [displayUploadCard, setDisplayUploadCard] = useState(false);

  const handleUploadCardState = () => {
    displayUploadCard ? setDisplayUploadCard(false) : setDisplayUploadCard(true);
  }

  const uploadCardProps = { 
    handleUploadCardState: handleUploadCardState
  }

  // ###########################################
  // ######## SECTION: Delete button ###########
  // ###########################################

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

    // need to create class method to delete remove node from data structure
    // also might need to come up with a different name for uuids to keep db id and class id seperate
    // console.log(constructDirTree.removeNodebyId(ids));
    // idArr.forEach(element => constructDirTree.removeNodebyId(element));
    console.log(childrenOfCurrentNode);
  }

  // console.log(constructDirTree);

  return (
    <>
      {displayUploadCard ?
        <UploadCard {...uploadCardProps} />
        : <div style={{"display": "none"}}></div> 
      }
      <div className='navWrapper prevent-select'>
        <button className='homeButton pointer' onClick={() => {
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
                  handleIdArrState={handleIdArrState}
                />
              ) : (
                <File
                  key={child.id}
                  name={child.name}
                  isIcon={isIcon}
                  id={child.id}
                  handleIdArrState={handleIdArrState}
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
                  handleIdArrState={handleIdArrState}
                />
              ) : (
                <File
                  key={child.id}
                  name={child.name}
                  isIcon={isIcon}
                  id={child.id}
                  handleIdArrState={handleIdArrState}
                />
              )
            )}
          </div>
        }
      </div>
    </>
  );
}
