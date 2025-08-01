import React, { useState, useContext } from "react";
import LoadingBars from "../Loading/loading";
import { IndexContext } from "../../utils/context";
import "../../css/folderTree.css";

export default function FolderTree({
  childrenOfRootNode,
  getChildNodes,
  handleFolderClick,
}) {
  const { setDisplayNodeId } = useContext(IndexContext);
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
        setDisplayNodeId(folderId);
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
          className="cyber-tree-item cyber-tree-folder"
        >
          <div className="cyber-tree-icon-wrapper">
            <svg className="cyber-tree-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path
                className="folder-back"
                d="M10 25 L35 25 L40 20 L90 20 L90 75 L10 75 Z"
                fill="#2fd6b5"
              />
              <path
                className="folder-front"
                d="M15 30 L35 30 L40 25 L85 25 L85 70 L15 70 Z"
                fill="#47ecc7"
              />
            </svg>
          </div>
          <span className="cyber-tree-name">{child.metadata.name}</span>
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
    <div className="cyber-tree-item cyber-tree-file" key={child.metadata.id}>
      <div className="cyber-tree-icon-wrapper">
        <svg className="cyber-tree-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path
            className="file-shape"
            d="M20 15 L65 15 L80 30 L80 85 L20 85 Z"
            fill="#ff0049"
          />
          <path
            className="file-corner"
            d="M65 15 L65 30 L80 30 Z"
            fill="#ff2a69"
          />
          <g stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none">
            <line x1="30" y1="40" x2="70" y2="40" />
            <line x1="30" y1="50" x2="70" y2="50" />
            <line x1="30" y1="60" x2="50" y2="60" />
          </g>
        </svg>
      </div>
      <span className="cyber-tree-name">{child.metadata.name}</span>
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