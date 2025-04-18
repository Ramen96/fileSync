import { useState, useEffect, useContext } from "react";
import { DisplayDirectoryContext, displayIconContext } from "../../utils/context";
import Folder from "../Folder/folder";
import File from "../File/file";
import LoadingBars from "../Loading/loading";

export default function HandleDisplayIcons() {
  const {
    childrenOfRootNode,
    isIcon,
    handleFolderClick,
    handleDeleteQueue,
    currentDisplayNodes,
    setCurrentDisplayNodes,
    updateDisplayNodes,
    pendingFileOperation,
    setPendingFileOperation,
  } = useContext(displayIconContext);

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
