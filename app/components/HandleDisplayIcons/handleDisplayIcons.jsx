import { useState, useEffect, useContext } from "react";
import Folder from "../Folder/folder";
import File from "../File/file";
import LoadingBars from "../Loading/loading";

export default function HandleDisplayIcons({ 
  childrenOfRootNode,
  isIcon,
  handleFolderClick,
  handleDeleteQueue,
  currentDisplayNodes,
  setCurrentDisplayNodes,
  updateDisplayNodes,
  pendingFileOperation, 
  setPendingFileOperation
}) {

  useEffect(() => {
    setCurrentDisplayNodes(childrenOfRootNode);
  }, [childrenOfRootNode]);

  
  if (!currentDisplayNodes || pendingFileOperation) {
    return <LoadingBars />
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
