import React, { useState, useMemo, useEffect } from 'react';
import File from "./File/file";
import Folder from "./Folder/folder";
import { DirectoryTree } from "../../../utils/DataStructures/directoryTree";
import "./displayDirectory.css";

export default function DisplayDirectory({ files }) {
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

  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [parentNodeId, setParentNodeId] = useState(null);
  const [lastChildNodeId, setLastChildNodeId] = useState(null);
  const [backHistory, setBackHistory] = useState([]);
  const [forwardHistory, setForwardHistory] = useState([]);

  useEffect(() => {
    if (constructDirTree) {
      setCurrentNodeId(constructDirTree.root.id);
    }
  }, [constructDirTree]);

  if (!files || files.length === 0) {
    return <h1 style={{ color: "white" }}>No Files (files is {JSON.stringify(files)})</h1>;
  }

  if (!constructDirTree) {
    return <h1 style={{ color: "white" }}>Loading...</h1>;
  }

  const currentNode = constructDirTree.getNodeById(currentNodeId);
  const childrenOfCurrentNode = currentNode ? currentNode.children : [];

  const handleNavClick = (direction) => {
    if (direction === 'backward') {
      const prevNodeId = backHistory[backHistory.length - 1];
      console.log('prevNodeID: ', prevNodeId);
      setCurrentNodeId(prevNodeId);
    } else if (direction === 'forward') {
      const nextNodeId = forwardHistory[0];
    }
  }

  const handleFolderClick = (folderId) => {
    if (backHistory.length === 0) {
      console.log(currentNodeId);

      setBackHistory([...backHistory, currentNodeId]);

      console.log('if statement: ', backHistory);
      setCurrentNodeId(folderId);
    } else if (backHistory.length > 0) {
      setBackHistory([...backHistory, folderId]);
      setCurrentNodeId(folderId);
      console.log(backHistory);
    }
  }

  return (
    <>
      <div className='navWrapper'>
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
            onClick={() => handleFolderClick(child.id)}
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
