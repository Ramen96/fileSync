import React, { useEffect, useState, useRef, useCallback } from "react";
import { wsContext } from "../../utils/context";
import LoadingBars from "../Loading/loading";
import folderIconColor from "../../../assets/open-yellow-folder.svg";
import folderIconGray from "../../../assets/yellow-folder.svg";
import file from "../../../assets/file2.svg";
import "../../css/folderTree.css";

export default function FolderTree({
  childrenOfRootNode,
  getChildNodes,
  handleFolderClick, 
}) {
  const [expandedFolders, setExpandedFolders] = useState({});
  const [loadingFolders, setLoadingFolders] = useState({});

  const handleExpand = async (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: prev[folderId] ? null : prev[folderId]
    }));

    if (!expandedFolders[folderId]) {
      setLoadingFolders(prev => ({ ...prev, [folderId]: true }));
      try {
        const children = await getChildNodes(folderId);
        setExpandedFolders(prev => ({
          ...prev,
          [folderId]: children[0]?.children || []
        }));
      } finally {
        setLoadingFolders(prev => ({ ...prev, [folderId]: false }));
      }
    }
  };

  const renderFolderItem = (child) => {
    const folderId = child.metadata.id;
    const isOpen = !!expandedFolders[folderId];
    const children = expandedFolders[folderId] || [];
    const isLoading = loadingFolders[folderId];

    return (
      <React.Fragment key={folderId}>
        <div
          onClick={() => {
            handleExpand(folderId); 
            if (typeof handleFolderClick === "function") {
              handleFolderClick(folderId); 
            }
          }}
        >
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
            {isLoading
              ? <LoadingBars />
              : <FolderTree
                  childrenOfRootNode={children}
                  getChildNodes={getChildNodes}
                  handleFolderClick={handleFolderClick} 
                />
            }
          </div>
        )}
      </React.Fragment>
    );
  };

  const renderFileItem = (child) => (
    <div className="sideItem" key={child.metadata.id}>
      <img className="sideBarIcon" src={file} alt="fileIcon" />
      <h3 className="sideItemName">{child.metadata.name}</h3>
    </div>
  );

  if (!Array.isArray(childrenOfRootNode)) {
    return <LoadingBars />;
  }

  return (
    <div>
      {childrenOfRootNode.map(child =>
        child.metadata?.is_folder
          ? renderFolderItem(child)
          : renderFileItem(child)
      )}
    </div>
  );
}