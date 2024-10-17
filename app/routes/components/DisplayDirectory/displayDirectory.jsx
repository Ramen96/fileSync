import React, { useState, useMemo, useEffect } from 'react';
import File from "./File/file";
import Folder from "./Folder/folder";
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

  // AJAX
  if (!files || files.length === 0) {
    return <h1 style={{ color: "white" }}>No Files (files is {JSON.stringify(files)})</h1>;
  }
  if (!constructDirTree) {
    return <h1 style={{ color: "white" }}>Loading...</h1>;
  }

  // Getting nodes for gui
  const currentNode = constructDirTree.getNodeById(currentNodeId);
  const childrenOfCurrentNode = currentNode ? currentNode.children : [];

  // Nav buttons
  const handleNavClick = (direction) => {
    const prevNodeId = backHistory[backHistory.length - 1];
    const nextNodeId = forwardHistory[0];

    function moveBack() {
      setForwardHistory([currentNodeId, ...forwardHistory]);
      setBackHistory(backHistory.slice(0, -1));
      setCurrentNodeId(prevNodeId);
    }

    if (direction === 'backward') {

      currentNodeId !== constructDirTree.root.id
        ? moveBack()
        : console.log('they are the same');
      
    } else if (direction === 'forward') {
      setBackHistory([...backHistory, currentNodeId]);
      setForwardHistory(forwardHistory.slice(1));
      setCurrentNodeId(nextNodeId);
    }
  }

  const handleFolderClick = (folderId) => {
      setBackHistory([...backHistory, currentNodeId]);
      setForwardHistory([]);
      setCurrentNodeId(folderId);
  }

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
