import { useState, useEffect } from "react";
import Folder from "../DisplayDirectory/Folder/folder";
import File from "../DisplayDirectory/File/file";

export default function HandleDisplayIcons({ 
  childrenOfRootNode,
  isIcon,
  handleFolderClick,
  handleIdArrState,
  dynamicDisplayNodeIDs, 
  setDynamicDisplayNodesIDs 
}) {

  const [ currentDisplayNodes, setCurrentDisplayNodes ] = useState(null);

  useEffect(() => {
    setCurrentDisplayNodes(childrenOfRootNode);
  }, [childrenOfRootNode]);
  
  const updateDisplayNodes = async (id) => {
    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }, 
        body: JSON.stringify({
          displayNodeId: id,
          requestType: 'get_child_nodes'
        })
      }
      const response = await fetch('/databaseApi', options)
      const body = await response.json();
      setCurrentDisplayNodes(body[0].children);
    } catch (err) {
      console.error(`error updating nodes for currentDisplayNodes ${err}`);
    }
  }

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