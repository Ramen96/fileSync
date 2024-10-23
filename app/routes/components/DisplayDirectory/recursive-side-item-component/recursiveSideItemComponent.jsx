import React from 'react';
import folderIconColor from "../../../../../assets/folder.svg";
import folderIconGray from "../../../../../assets/folder2.svg";
import file from "../../../../../assets/file.svg";
import "../displayDirectory.css";

export default function RecursiveSideItemComponent({ 
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


  function handleFolderClick(folderId) {
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

  return childrenOfCurrentNode.map(child => {
    if (child.type === 'folder') {
      const isExpanded = showStateList.includes(child.id);
      return (
        <React.Fragment key={child.id}>
          <div 
            onClick={() => {
              handleFolderClick(child.id);
            }}
          >
            {isExpanded ? (
              <div className="sideItem">
                <img className='sideBarIcon' src={folderIconColor} alt="folderIcon" />
                <h3 className="sideItemName">{child.name}</h3>
              </div>
            ) : (
              <div className="sideItem">
                <img className='sideBarIcon' src={folderIconGray} alt="folderIcon" />
                <h3 className="sideItemName">{child.name}</h3>
              </div>
            )}
          </div>
          {isExpanded && (
            <div
              className="sideFolderDropDown"
              style={{ display: "block" }}
            >
              <RecursiveSideItemComponent
                childrenOfCurrentNode={getChildNodes(child.id)}
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
      );
      } else {
        return (
          <div key={child.id} className="sideItem">
            <img className='sideBarIcon' src={file} alt="fileIcon" />
            <h3 className="sideItemName">{child.name}</h3>
          </div>
        );
      }
    });
  };
