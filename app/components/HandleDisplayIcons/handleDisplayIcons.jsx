import { useState, useEffect, useContext } from "react";
import { DisplayDirectoryContext, IndexContext } from "../../utils/context";
import FileSystemItem from "../FileSystemItem/fileSystemItem";
import LoadingBars from "../Loading/loading";

export default function HandleDisplayIcons() {
  const {
    isIcon,
    handleFolderClick,
    handleDeleteQueue,
    currentDisplayNodes,
    setCurrentDisplayNodes,
    updateDisplayNodes,
  } = useContext(DisplayDirectoryContext);
  const {
    childrenOfRootNode,
    pendingFileOperation
  } = useContext(IndexContext);
  
  useEffect(() => {
    setCurrentDisplayNodes(childrenOfRootNode);
  }, [childrenOfRootNode]);
  
  if (!currentDisplayNodes || pendingFileOperation) {
    return <LoadingBars />
  }
  
  return currentDisplayNodes.map(child => {
    const isFolder = child.metadata?.is_folder === true;
    
    return (
      <FileSystemItem
        key={child.metadata.id}
        name={child.metadata.name}
        id={child.metadata.id}
        isFolder={isFolder}
        isIcon={isIcon}
        handleFolderClick={handleFolderClick}
        handleDeleteQueue={handleDeleteQueue}
        updateDisplayNodes={updateDisplayNodes}
      />
    );
  });
}

