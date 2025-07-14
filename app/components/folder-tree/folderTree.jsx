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
  const [isExpanded, setIsExpanded] = useState(new Set());
  const [localPendingFileOperation, setLocalPendingFileOperation] = useState(false);

  const [forceRender, setForceRender] = useState(0);
  const [cacheVersion, setCacheVersion] = useState(0);

  const forceUpdate = useCallback(() => {
    setForceRender(prev => prev + 1);
  }, []);

  const childNodesMapRef = useRef(new Map());
  const isExpandedRef = useRef(new Set());
  const pendingOperationsRef = useRef(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

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
        setTimeout(() => {
          if (mountedRef.current) {
            setLocalPendingFileOperation(false);
          }
        }, 100);
      };

      refreshExpandedFolders();
    }
  }, [reloadTrigger, getChildNodes]);

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
    if (!forceRefresh && childNodesMapRef.current.has(folderId)) {
      return childNodesMapRef.current.get(folderId);
    }

    if (pendingOperationsRef.current.has(folderId)) {
      return [];
    }

    try {
      pendingOperationsRef.current.add(folderId);
      const children = await getChildNodes(folderId);
      const childrenData = children[0]?.children || [];

      if (mountedRef.current) {
        childNodesMapRef.current.set(folderId, childrenData);
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
              key={`${folderId}-${cacheVersion}`}
            />
          </div>
        )}
      </React.Fragment>
    );
  }, [isExpanded, handleExpandFolder, getCachedChildren, showStateList, setShowStateList, getChildNodes, setCurrentNodeId, currentNodeId, setForwardHistory, backHistory, setBackHistory, handleFolderClick, displayNodeId, setPendingFileOperation, pendingFileOperation, reloadTrigger]);

  const renderFileItem = useCallback((child) => (
    <div className="sideItem" key={child.metadata.id}>
      <img className="sideBarIcon" src={file} alt="fileIcon" />
      <h3 className="sideItemName">{child.metadata.name}</h3>
    </div>
  ), []);

  if (!childrenOfRootNode || localPendingFileOperation || pendingFileOperation) {
    return <LoadingBars />;
  }

  return childrenOfRootNode.map((child) => {
    const isFolder = child.metadata?.is_folder === true;
    return isFolder ? renderFolderItem(child) : renderFileItem(child);
  });
}