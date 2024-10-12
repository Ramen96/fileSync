import React, { useState, useMemo } from 'react';
import File from "./File/file";
import Folder from "./Folder/folder";
import { DirectoryTree } from "../../../utils/DataStructures/directoryTree";

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

  return (
    <>
      {childrenOfCurrentNode.map(child => 
        child.type === 'folder' ? (
          <Folder 
            key={child.id}
            name={child.name}
            id={child.id}
            setCurrentNodeId={setCurrentNodeId}
            treeStructure={constructDirTree}
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