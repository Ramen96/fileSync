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

  useEffect(() => {
    if (constructDirTree) {
      setCurrentNodeId(constructDirTree.root.id);
      setParentNodeId(constructDirTree.root.parentId);
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

  const handleNavClick = (forwardOrBackward) => {
    if (forwardOrBackward === 'backward' && parentNodeId !== null) {
      setLastChildNodeId(currentNodeId);
      setCurrentNodeId(currentNodeId.parentId);
      const newParentNode = constructDirTree.getNodeById(parentNodeId);
      setParentNodeId(newParentNode ? newParentNode.parentId : null);
    } else if (forwardOrBackward === 'forward' && lastChildNodeId !== null) {
      setCurrentNodeId(lastChildNodeId);
      setParentNodeId(currentNodeId);
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
            setCurrentNodeId={setCurrentNodeId}
            setParentNodeId={setParentNodeId}
            parentNodeId={child.parentId}
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
