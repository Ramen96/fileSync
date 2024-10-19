import React, { useState, useMemo, useEffect, Children } from 'react';
import File from "./File/file";
import Folder from "./Folder/folder";
import SideFolder from './side-folder/SideFolder';
import SideFile from './side-file/SideFile';
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

      currentNodeId !== constructDirTree.root.id
        ? moveBack()
        : console.log('they are the same');
      
    } else if (direction === 'forward') {
      nextNodeId === undefined
        ? console.log('end of list')
        : moveForward();
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

  return (
    <>
      <div className='navWrapper'>
        <button className='homeButton' onClick={() => {
          setCurrentNodeId(constructDirTree.root.id)
          setForwardHistory([]);
          setBackHistory([]);
        }}>
          <p>Home</p>
        </button>
        <button className='navButton' onClick={() => handleNavClick('backward')}>
          <p className='greaterThanLessThan'>&lt;</p>
        </button>
        <button className='navButton' onClick={() => handleNavClick('forward')}>
          <p className='greaterThanLessThan'>&gt;</p>
        </button>
      </div>
      <div className='mainWindowWrapper'>
      <div className='dirTreeSideBar'>
        {
          // 1) Use state for dropdown component of SideFolder
          //    -- Create wrapper element with onClick functon to set state
          // 2) Get the id of the node for the parrent folder to map it's children
          // 3) Add margin-left to a wrapper containt the child componets for 
          //    a more visual representaion of the folder structure.

          childrenOfCurrentNode.map(child =>
            child.type === 'folder' ? (
              <div key={child.id} 
                onClick={() => {
                  
                  showStateList.includes(child.id)
                    ? setShowStateList(showStateList.filter(i => child.id !== i))
                    : setShowStateList([...showStateList, child.id]);
                  
                  }}
              className='sideFolderWrapper'>
              {showStateList.includes(child.id)
                ? (
                  <>
                    <SideFolder
                      key={child.id} 
                      name={child.name}
                      id={child.id}
                    />
                    
                    <div 
                      className='sideFolderDropDown'
                      style={{"display": 'block' }}>
                      {
                        getChildNodes(child.id).map(childNode => 
                          childNode.type === 'folder' ?
                            <div
                              key={childNode.id}
                              onClick={() => {
                                 showStateList.includes(childNode.id)
                                 ? setShowStateList(showStateList.filter(i => childNode.id !== i))
                                 : setShowStateList([...showStateList, childNode.id]);
                                }}
                            >
                              <SideFolder 
                               key={childNode.id}
                               name={childNode.name}
                               id={childNode.id}
                               
                              />
                            </div>
                          :
                            <SideFile
                              key={childNode.id}
                              name={childNode.name}
                            />
                        )
                      }
                    </div>
                  </>
              ) : (
                  <>
                    <SideFolder
                      key={child.id} 
                      name={child.name}
                      id={child.id}
                      />
                    <div 
                      className='sideFolderDropDown'
                      style={{"display": 'none' }}>
                    </div>
                  </>
                )
              }
              </div>
            ) : (
              <SideFile 
                key={child.id}
                name={child.name}
              />
            )
          )
        }
      </div>
        {childrenOfCurrentNode.map(child => 
          child.type === 'folder' ? (
            <Folder 
            key={child.id}
            name={child.name}
            id={child.id}
            handleFolderClick={handleFolderClick}
            />
          ) : (
            <File
            key={child.id}
            name={child.name}
            />
          )
        )}
      </div>
    </>
  );
}
