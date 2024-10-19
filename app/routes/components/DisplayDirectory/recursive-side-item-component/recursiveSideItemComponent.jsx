import React from 'react';
import "../displayDirectory.css";

export default function RecursiveSideItemComponent({ 
    childrenOfCurrentNode, 
    showStateList, 
    setShowStateList, 
    getChildNodes 
  }) {
  return childrenOfCurrentNode.map(child => {
    if (child.type === 'folder') {
      const isExpanded = showStateList.includes(child.id);
      return (
        <React.Fragment key={child.id}>
          <div 
            onClick={() => {
              setShowStateList(prevState => 
                isExpanded
                  ? prevState.filter(id => id !== child.id)
                  : [...prevState, child.id]
              );
            }}
          >
            <div className="sideItem">
              <h3 className="sideItemName">{child.name}</h3>
            </div>
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
              />
            </div>
          )}
        </React.Fragment>
      );
      } else {
        return (
          <div key={child.id} className="sideItem">
            <h3 className="sideItemName">{child.name}</h3>
          </div>
        );
      }
    });
  };