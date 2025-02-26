import { useState, useEffect } from "react";
import Folder from "../Folder/folder";
import File from "../File/file";

export default function HandleDisplayIcons({ 
  childrenOfRootNode,
  isIcon,
  handleFolderClick,
  handleDeleteQueue,
  currentDisplayNodes,
  setCurrentDisplayNodes,
  updateDisplayNodes
}) {

  useEffect(() => {
    setCurrentDisplayNodes(childrenOfRootNode);
  }, [childrenOfRootNode]);
  
  if (!currentDisplayNodes) {
    return <h1>Loading...</h1>
  }

  return currentDisplayNodes.map(child => {
    const isFolder = child.metadata?.is_folder === true;
    
    return isFolder ? (
      <Folder 
        updateDisplayNodes={updateDisplayNodes} 
        key={child.metadata.id}
        name={child.metadata.name}
        id={child.metadata.id}
        isIcon={isIcon}
        handleFolderClick={handleFolderClick}
        handleDeleteQueue={handleDeleteQueue}
      />
    ) : (
      <File 
        key={child.metadata.id}
        id={child.metadata.id}
        name={child.metadata.name}
        isIcon={isIcon}
        handleDeleteQueue={handleDeleteQueue}
      />
    );
  })
}