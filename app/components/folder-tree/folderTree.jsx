import React, { useEffect, useState, useContext } from 'react';
import { wsContext } from '../../utils/context';
import LoadingBars from '../Loading/loading';
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
  pendingFileOperation,
  displayNodeId,
  setPendingFileOperation,
}) {

  const socket = useContext(wsContext);
  const [isExpanded, setIsExpanded] = useState(new Set());
  const [childNodesMap, setChildNodesMap] = useState(new Map());

  async function handleExpandFolder(folderId, parent_id) {
    if (!isExpanded.has(folderId)) {
      if (!childNodesMap.has(folderId)) {
        const children = await getChildNodes(folderId);
        setChildNodesMap((prevMap) =>
          new Map(prevMap).set(folderId, children[0]?.children || [])
        );
      }
      setIsExpanded((prevSet) => new Set([...prevSet, folderId]));
    } else {
      setIsExpanded((prevSet) => {
        const newSet = new Set(prevSet);
        newSet.delete(folderId);
        return newSet;
      });
    }

    if (isExpanded.has(folderId)) {
      await handleFolderClick(parent_id);
    } else {
      await handleFolderClick(folderId);
    }
  }

  if (!childrenOfRootNode || pendingFileOperation) {
    return <LoadingBars />;
  }

  socket.addEventListener("message", async (event) => {
    const data = JSON.parse(event?.data);
    const message = data?.message;

    if (message === 'reload') {
      // fetch data 
      try {
        const reloadId = data?.id;
        const newChildNodes = await getChildNodes(reloadId);
        setChildNodesMap(newChildNodes);
      } catch (error) {
        console.log(`Error fetching data ${error}`);
      }
    }
  });

  return childrenOfRootNode.map((child) => {
    const isFolder = child.metadata?.is_folder === true;
    return isFolder ? (
      <React.Fragment key={child.metadata.id}>
        <div
          onClick={() => handleExpandFolder(child.metadata.id, child.parent_id)}
        >
          {isExpanded.has(child.metadata.id) ? (
            <div className="sideItem">
              <img
                className="sideBarIcon"
                src={folderIconColor}
                alt="folderIcon"
              />
              <h3 className="sideItemName">{child.metadata.name}</h3>
            </div>
          ) : (
            <div className="sideItem">
              <img
                className="sideBarIcon"
                src={folderIconGray}
                alt="folderIcon"
              />
              <h3 className="sideItemName">{child.metadata.name}</h3>
            </div>
          )}
        </div>
        {isExpanded.has(child.metadata.id) && (
          <div className="sideFolderDropDown" style={{ display: "block" }}>
            <FolderTree
              childrenOfRootNode={childNodesMap.get(child.metadata.id) || []}
              showStateList={showStateList}
              setShowStateList={setShowStateList}
              getChildNodes={getChildNodes}
              currentNodeId={currentNodeId}
              setCurrentNodeId={setCurrentNodeId}
              setForwardHistory={setForwardHistory}
              backHistory={backHistory}
              setBackHistory={setBackHistory}
              handleFolderClick={handleFolderClick}
            />
          </div>
        )}
      </React.Fragment>
    ) : (
      <div className="sideItem" key={child.metadata.id}>
        <img className="sideBarIcon" src={file} alt="fileIcon" />
        <h3 className="sideItemName">{child.metadata.name}</h3>
      </div>
    );
  });
};
