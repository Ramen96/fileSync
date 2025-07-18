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
  pendingFileOperation,
  reloadTrigger,
}) {
  console.log(`=== FOLDERTREE COMPONENT RENDER ===`);
  console.log(`childrenOfRootNode:`, childrenOfRootNode);
  console.log(`pendingFileOperation:`, pendingFileOperation);
  console.log(`reloadTrigger:`, reloadTrigger);
  
  const [isExpanded, setIsExpanded] = useState(new Set());
  const [localPendingFileOperation, setLocalPendingFileOperation] = useState(false);
  const [forceRender, setForceRender] = useState(0);
  const [cacheVersion, setCacheVersion] = useState(0);

  const forceUpdate = () => {
    setForceRender(prev => prev + 1);
  };

  const childNodesMapRef = useRef(new Map());
  const isExpandedRef = useRef(new Set());
  const pendingOperationsRef = useRef(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  // Clear cache and refresh when reloadTrigger changes
  useEffect(() => {
    if (reloadTrigger > 0) {
      console.log('FolderTree: Clearing cache and refreshing expanded folders due to reload trigger');
      setLocalPendingFileOperation(true);
      setCacheVersion(prev => prev + 1);
      childNodesMapRef.current.clear();
      pendingOperationsRef.current.clear();

      const refreshExpandedFolders = async () => {
        const expandedArray = Array.from(isExpandedRef.current);

        if (expandedArray.length > 0) {
          try {
            const refreshPromises = expandedArray.map(async (folderId) => {
              try {
                const children = await getChildNodes(folderId);
                const childrenData = children[0]?.children || [];
                if (mountedRef.current) {
                  childNodesMapRef.current.set(folderId, childrenData);
                }
                return { folderId, success: true };
              } catch (error) {
                console.error(`Error refreshing folder ${folderId}:`, error);
                return { folderId, success: false };
              }
            });
            await Promise.all(refreshPromises);
            if (mountedRef.current) {
              setForceRender(prev => prev + 1);
            }
          } catch (error) {
            console.error('Error during bulk folder refresh:', error);
          }
        }
        
        // Force a re-render to pick up the new childrenOfRootNode
        setTimeout(() => {
          if (mountedRef.current) {
            setLocalPendingFileOperation(false);
            setForceRender(prev => prev + 1);
          }
        }, 100);
      };

      refreshExpandedFolders();
    }
  }, [reloadTrigger, getChildNodes]);

  // Force re-render when childrenOfRootNode changes
  useEffect(() => {
    if (childrenOfRootNode) {
      setForceRender(prev => prev + 1);
    }
  }, [childrenOfRootNode]);

  useEffect(() => {
    if (!pendingFileOperation && localPendingFileOperation) {
      setLocalPendingFileOperation(false);
    }
  }, [pendingFileOperation, localPendingFileOperation]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const getChildNodesWithCache = useCallback(async (folderId, forceRefresh = false) => {
    console.log(`=== GET CHILD NODES DEBUG ===`);
    console.log(`Requesting children for folder ID: ${folderId}`);
    console.log(`Force refresh: ${forceRefresh}`);
    console.log(`Already cached: ${childNodesMapRef.current.has(folderId)}`);
    console.log(`Pending operation: ${pendingOperationsRef.current.has(folderId)}`);

    if (!forceRefresh && childNodesMapRef.current.has(folderId)) {
      const cached = childNodesMapRef.current.get(folderId);
      console.log(`Returning cached children (${cached.length} items):`, cached);
      return cached;
    }

    if (pendingOperationsRef.current.has(folderId)) {
      console.log(`Operation already pending for ${folderId}, returning empty array`);
      return [];
    }

    try {
      pendingOperationsRef.current.add(folderId);
      console.log(`Fetching children from API for ${folderId}`);
      const children = await getChildNodes(folderId);
      console.log(`Raw API response:`, children);
      const childrenData = children[0]?.children || [];
      console.log(`Processed children data (${childrenData.length} items):`, childrenData);

      if (mountedRef.current) {
        childNodesMapRef.current.set(folderId, childrenData);
        console.log(`Cached children for ${folderId}`);
      }

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
        if (mountedRef.current) {
          setIsExpanded(prevSet => new Set([...prevSet, folderId]));
        }
        await handleFolderClick(folderId);
      } catch (error) {
        console.error(`Error expanding folder ${folderId}:`, error);
      }
    } else {
      if (mountedRef.current) {
        setIsExpanded(prevSet => {
          const newSet = new Set(prevSet);
          newSet.delete(folderId);
          return newSet;
        });
      }
      await handleFolderClick(parent_id);
    }
  }, [getChildNodesWithCache, handleFolderClick]);

  const getCachedChildren = (folderId) => {
    return childNodesMapRef.current.get(folderId) || [];
  };

  const renderFolderItem = (child) => {
    const folderId = child.metadata.id;
    const isOpen = isExpanded.has(folderId);
    const cachedChildren = getCachedChildren(folderId);

    console.log(`=== FOLDER ITEM DEBUG ===`);
    console.log(`Folder: ${child.metadata.name} (ID: ${folderId})`);
    console.log(`Is Open: ${isOpen}`);
    console.log(`Is Folder: ${child.metadata?.is_folder}`);
    console.log(`Cached Children Count: ${cachedChildren.length}`);
    console.log(`Cached Children:`, cachedChildren);
    
    if (cachedChildren.length > 0) {
      console.log(`First cached child:`, cachedChildren[0]);
      console.log(`First cached child is folder:`, cachedChildren[0].metadata?.is_folder);
    }

    return (
      <React.Fragment key={`${folderId}-${cacheVersion}-${forceRender}`}>
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
              childrenOfRootNode={cachedChildren}
              showStateList={showStateList}
              setShowStateList={setShowStateList}
              getChildNodes={getChildNodes}
              setCurrentNodeId={setCurrentNodeId}
              currentNodeId={currentNodeId}
              setForwardHistory={setForwardHistory}
              backHistory={backHistory}
              setBackHistory={setBackHistory}
              handleFolderClick={handleFolderClick}
              displayNodeId={displayNodeId}
              setPendingFileOperation={setPendingFileOperation}
              pendingFileOperation={pendingFileOperation}
              reloadTrigger={reloadTrigger}
              key={`${folderId}-${cacheVersion}-${forceRender}`}
            />
          </div>
        )}
      </React.Fragment>
    );
  };

  const renderFileItem = (child) => (
    <div className="sideItem" key={`${child.metadata.id}-${cacheVersion}-${forceRender}`}>
      <img className="sideBarIcon" src={file} alt="fileIcon" />
      <h3 className="sideItemName">{child.metadata.name}</h3>
    </div>
  );

  if (!childrenOfRootNode || localPendingFileOperation || pendingFileOperation) {
    return <LoadingBars />;
  }

  return (
    <div key={`root-${cacheVersion}-${forceRender}`}>
      <div style={{ border: '1px solid red', padding: '5px', margin: '2px' }}>
        <small>FolderTree Instance - Items: {childrenOfRootNode?.length || 0}</small>
      </div>
      {childrenOfRootNode.map((child) => {
        console.log(`=== MAIN RENDER DEBUG ===`);
        console.log(`Processing child: ${child.metadata?.name} (ID: ${child.metadata?.id})`);
        console.log(`Child data:`, child);
        console.log(`Is folder check: ${child.metadata?.is_folder === true}`);
        console.log(`Cache version: ${cacheVersion}`);
        
        const isFolder = child.metadata?.is_folder === true;
        console.log(`Rendering as: ${isFolder ? 'FOLDER' : 'FILE'}`);
        
        return isFolder ? renderFolderItem(child) : renderFileItem(child);
      })}
    </div>
  );
}