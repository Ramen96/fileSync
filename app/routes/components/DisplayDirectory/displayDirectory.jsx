import React, { useState, useMemo, useEffect } from 'react';
import File from "./File/file";
import Folder from "./Folder/folder";
import { DirectoryTree } from "../../../utils/DataStructures/directoryTree";
import "./displayDirectory.css";

export default function DisplayDirectory({ files }) {
  const constructDirTree = useMemo(() => {
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

  const [currentNodeId, setCurrentNodeId] = useState(constructDirTree.root.id);

  if (!files || files.length === 0) {
    return <h1 style={{ color: "white" }}>No Files (files is {JSON.stringify(files)})</h1>;
  }

  const childrenOfCurrentNode = constructDirTree.getNodeById(currentNodeId).children;
  const currentNode = constructDirTree.getNodeById(currentNodeId);
  const [parrentNodeId, setParrentNodeId] = useState(currentNode.parentId);
  const [lastChildNodeId, setLastChildNodeId] = useState(null);

  useEffect(() => {
    setParrentNodeId(currentNode.parentId);
  }, [currentNodeId])


  const handleNavClick = (forwardOrBackward) => {
    function backward() {
      setLastChildNodeId(currentNodeId)
      setCurrentNodeId(parrentNodeId)
      setParrentNodeId(parrentNodeId)
    }
    function forward() {
      setCurrentNodeId(lastChildNodeId)
    }
    if (forwardOrBackward === 'backward') {
      parrentNodeId === null
        ? console.error('parrent node id is null')
        : backward();
    } else if (forwardOrBackward === 'forward') {
      lastChildNodeId === null
        ? console.error('last child node id is null')
        : forward();
    }
  }

  return (
    <>
      <div className='navWrapper'>
        <button className='navButton' onClick={() => {
          handleNavClick('backward');
        }}>
          <p className='greaterThanLessThan'>&lt;</p>
        </button>
        <button className='navButton' onClick={() => {
          handleNavClick('forward');
        }}>
          <p className='greaterThanLessThan'>&gt;</p>
        </button>
      </div>
      {childrenOfCurrentNode.map(child => 
        child.type === 'folder' ? (
          <Folder 
            key={child.id}
            name={child.name}
            id={child.id}
            setCurrentNodeId={setCurrentNodeId}
            setParrentNodeId={setParrentNodeId}
            parrentNodeId={child.parentId}
          />
        ) : (
          <File
            key={child.id}
            name={child.name}
          />
        )
      )}
    </>
  );
}