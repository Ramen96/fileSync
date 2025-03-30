import { useState, useEffect } from "react";
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
  updateDisplayNodes
}) {

  useEffect(() => {
    setCurrentDisplayNodes(childrenOfRootNode);
  }, [childrenOfRootNode]);


  // // Creates a new WebSocket connection to the specified URL.
  // const socket = new WebSocket('ws://filesync.home:3030');

  // // Executes when the connection is successfully established.
  // socket.addEventListener('open', event => {
  //   console.log('WebSocket connection established!');
  //   // Sends a message to the WebSocket server.
  //   socket.send('Hello Server!');
  // });

  // // Listen for messages and executes when a message is received from the server.
  // socket.addEventListener('message', event => {
  //   console.log('Message from server: ', event.data);
  // });

  // // Executes when the connection is closed, providing the close code and reason.
  // socket.addEventListener('close', event => {
  //   console.log('WebSocket connection closed:', event.code, event.reason);
  // });

  // // Executes if an error occurs during the WebSocket communication.
  // socket.addEventListener('error', error => {
  //   console.error('WebSocket error:', error);
  // });

  
  if (!currentDisplayNodes) {
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