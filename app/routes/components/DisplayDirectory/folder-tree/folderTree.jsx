import React, { useEffect } from 'react';
import { useState } from 'react';
import folderIconColor from "../../../../../assets/open-yellow-folder.svg";
import folderIconGray from "../../../../../assets/yellow-folder.svg";
import file from "../../../../../assets/file2.svg";
import "../displayDirectory.css";

export default function FolderTree({ 
    childrenOfCurrentNode, 
    showStateList, 
    setShowStateList, 
    getChildNodes,
    setCurrentNodeId,
    currentNodeId,
    setForwardHistory,
    backHistory,
    setBackHistory
  }) {

  // let isExpanded = false;
  const [ isExpanded, setIsExpanded ] = useState(false);
  const [ nextChildNodes, setNextChildNodes ] = useState(null);

  const childNodes = async (id) => {
    const children = await getChildNodes(id);
    return children[0].children
  }

  async function handleDoubleClick(folderId) {
    if (isExpanded && folderId === currentNodeId) {

    }
    setCurrentNodeId(folderId);
    setBackHistory([...backHistory, folderId]);
    setForwardHistory([]);
  }

  async function handleFolderClick(folderId) {
    // const children = await childNodes(folderId);
    setNextChildNodes(await childNodes(folderId));
    setIsExpanded(!isExpanded);
    const isExpandedCheck = showStateList.includes(folderId);
    if (!isExpandedCheck) {
      setShowStateList(prevState => [...prevState, folderId]);
      setCurrentNodeId(folderId);
      setBackHistory([...backHistory, folderId]);
      setForwardHistory([]);
    } else if (isExpandedCheck && folderId === currentNodeId) {
      setShowStateList(prevState => 
        prevState.filter(id => id !== folderId)
      )
    } else if (isExpandedCheck && folderId !== currentNodeId) {
      setCurrentNodeId(folderId);
      setBackHistory([...backHistory, folderId]);
      setForwardHistory([]);     
    }
  }

  if (!childrenOfCurrentNode) {
    return <h1>Loading...</h1>
  }

  return childrenOfCurrentNode.map(child => {
    const isFolder = child.metadata?.is_folder === true;
    // const updatedChildNodes = await childNodes()
    return isFolder ? (
      <React.Fragment 
        key={child.metadata.id}
        >
        <div 
          onClick={() => {
            handleFolderClick(child.metadata.id);
          }}
          onDoubleClick={() => {
            handleDoubleClick(child.metadata.id);
          }}
          >
          {isExpanded ? (
            <div className="sideItem">
              <img className='sideBarIcon' src={folderIconColor} alt="folderIcon" />
              <h3 className="sideItemName">{child.metadata.name}</h3>
            </div>
          ) : (
            <div className="sideItem">
              <img className='sideBarIcon' src={folderIconGray} alt="folderIcon" />
              <h3 className="sideItemName">{child.metadata.name}</h3>
            </div>
          )}
        </div>
        {isExpanded && (
          <div
            className="sideFolderDropDown"
            style={{ display: "block" }}
          >
          <FolderTree
            childrenOfCurrentNode={nextChildNodes}
            showStateList={showStateList}
            setShowStateList={setShowStateList}
            getChildNodes={getChildNodes}
            currentNodeId={currentNodeId}
            setCurrentNodeId={setCurrentNodeId}
            setForwardHistory={setForwardHistory}
            backHistory={backHistory}
            setBackHistory={setBackHistory}
          />
        </div>
        )}
      </React.Fragment>
    ) : (
      <div className="sideItem" key={child.metadata.id}>
        <img className='sideBarIcon' src={file} alt="fileIcon" />
        <h3 className="sideItemName">{child.metadata.name}</h3>
      </div>
    );
  })
};
