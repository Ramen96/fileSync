import React, { useEffect, useState, useRef, useCallback } from "react";
import { wsContext } from "../../utils/context";
import LoadingBars from "../Loading/loading";
import folderIconColor from "../../../assets/open-yellow-folder.svg";
import folderIconGray from "../../../assets/yellow-folder.svg";
import file from "../../../assets/file2.svg";
import "../../css/folderTree.css";

export default function FolderTree({
  childrenOfRootNode,
  showStateList,
  setShowStateList,
  getChildNodes,
  setCurrentNodeId,
  currentNodeId,
  setForwardHistory,
  backHistory,
  setBackHistory,
  handleFolderClick,
  displayNodeId,
  setPendingFileOperation,
}) {
  const [isExpanded, setIsExpanded] = useState(new Set());
  const [localPendingFileOperation, setLocalPendingFileOperation] = useState(false);

  const childNodesMapRef = useRef(new Map());
  const isExpandedRef = useRef(new Set());
  const pendingOperationsRef = useRef(new Set());
  
  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  const getChildNodesWithCache = useCallback(async (folderId) => {
    if (childNodesMapRef.current.has(folderId)) {
      return childNodesMapRef.current.get(folderId);
    }

    if (pendingOperationsRef.current.has(folderId)) {
      return [];
    }

    try {
      pendingOperationsRef.current.add(folderId);
      const children = await getChildNodes(folderId);
      const childrenData = children[0]?.children || [];
      
      childNodesMapRef.current.set(folderId, childrenData);
      
      return childrenData;
    } catch (error) {
      console.error(`Error fetching child nodes for ${folderId}:`, error);
      return [];
    } finally {
      pendingOperationsRef.current.delete(folderId);
    }
  }, [getChildNodes]);

  const handleExpandFolder = useCallback(async (folderId, parent_id) => {
    const wasExpanded = isExpandedRef.current.has(folderId);
    
    if (!wasExpanded) {
      try {
        await getChildNodesWithCache(folderId);
        setIsExpanded(prevSet => new Set([...prevSet, folderId]));
        await handleFolderClick(folderId);
      } catch (error) {
        console.error(`Error expanding folder ${folderId}:`, error);
      }
    } else {
      // Collapsing folder
      setIsExpanded(prevSet => {
        const newSet = new Set(prevSet);
        newSet.delete(folderId);
        return newSet;
      });
      await handleFolderClick(parent_id);
    }
  }, [getChildNodesWithCache, handleFolderClick]);

  const handleWebSocketMessage = useCallback(async (event) => {
    try {
      const data = JSON.parse(event?.data);
      const message = data?.message;

      if (message === "reload") {
        setLocalPendingFileOperation(true);
        const reloadId = data?.id;
        
        childNodesMapRef.current.delete(reloadId);
        
        await getChildNodesWithCache(reloadId);
        setLocalPendingFileOperation(false);
      }
    } catch (error) {
      console.error(`Error handling WebSocket message:`, error);
      setLocalPendingFileOperation(false);
    }
  }, [getChildNodesWithCache]);

  useEffect(() => {
    // const socket = wsContext; // or however you get your WebSocket instance
    // if (socket) {
    //   socket.addEventListener("message", handleWebSocketMessage);
    //   return () => {
    //     socket.removeEventListener("message", handleWebSocketMessage);
    //   };
    // }
  }, [handleWebSocketMessage]);

  const getCachedChildren = useCallback((folderId) => {
    return childNodesMapRef.current.get(folderId) || [];
  }, []);

  const renderFolderItem = useCallback((child) => {
    const folderId = child.metadata.id;
    const isOpen = isExpanded.has(folderId);
    
    return (
      <React.Fragment key={folderId}>
        <div onClick={() => handleExpandFolder(folderId, child.parent_id)}>
          <div className="sideItem">
            <img
              className="sideBarIcon"
              src={isOpen ? folderIconColor : folderIconGray}
              alt="folderIcon"
            />
            <h3 className="sideItemName">{child.metadata.name}</h3>
          </div>
        </div>
        {isOpen && (
          <div className="sideFolderDropDown" style={{ display: "block" }}>
            <FolderTree
              childrenOfRootNode={getCachedChildren(folderId)}
              showStateList={showStateList}
              setShowStateList={setShowStateList}
              getChildNodes={getChildNodes}
              currentNodeId={currentNodeId}
              setCurrentNodeId={setCurrentNodeId}
              setForwardHistory={setForwardHistory}
              backHistory={backHistory}
              setBackHistory={setBackHistory}
              handleFolderClick={handleFolderClick}
              displayNodeId={displayNodeId}
              setPendingFileOperation={setPendingFileOperation}
            />
          </div>
        )}
      </React.Fragment>
    );
  }, [isExpanded, handleExpandFolder, getCachedChildren, showStateList, setShowStateList, getChildNodes, currentNodeId, setCurrentNodeId, setForwardHistory, backHistory, setBackHistory, handleFolderClick, displayNodeId, setPendingFileOperation]);

  const renderFileItem = useCallback((child) => (
    <div className="sideItem" key={child.metadata.id}>
      <img className="sideBarIcon" src={file} alt="fileIcon" />
      <h3 className="sideItemName">{child.metadata.name}</h3>
    </div>
  ), []);

  if (!childrenOfRootNode || localPendingFileOperation) {
    return <LoadingBars />;
  }

  return childrenOfRootNode.map((child) => {
    const isFolder = child.metadata?.is_folder === true;
    return isFolder ? renderFolderItem(child) : renderFileItem(child);
  });
}