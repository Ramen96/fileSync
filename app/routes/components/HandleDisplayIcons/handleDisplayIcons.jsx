import { useState, useEffect } from "react";
import Folder from "../DisplayDirectory/Folder/folder";
import File from "../DisplayDirectory/File/file";

export default function HandleDisplayIcons({ 
  childrenOfRootNode,
  isIcon,
  handleFolderClick,
  handleIdArrState,
  currentDisplayNodes,
  setCurrentDisplayNodes,
  updateDisplayNodes
}) {


  useEffect(() => {
    setCurrentDisplayNodes(childrenOfRootNode);
  }, [childrenOfRootNode]);
  

  useEffect(() => {
    setCurrentDisplayNodes(currentDisplayNodes)
  }, [currentDisplayNodes])

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
        handleIdArrState={handleIdArrState}
      />
    ) : (
      <File 
        key={child.metadata.id}
        id={child.metadata.id}
        name={child.metadata.name}
        isIcon={isIcon}
        handleIdArrState={handleIdArrState}
      />
    );
  })
}