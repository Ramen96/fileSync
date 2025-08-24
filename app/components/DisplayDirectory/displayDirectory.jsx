import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback
} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Sidebar,
  Grid,
  List,
  Trash,
  Download,
  Upload,
  MousePointerClick,
  Menu 
} from 'lucide-react';
import {
  DisplayDirectoryContext,
  IndexContext
} from '../../utils/context';
import UploadCard from '../UploadCard/uploadCard';
import FolderTree from '../folder-tree/folderTree';
import HandleDisplayIcons from '../HandleDisplayIcons/handleDisplayIcons';
import "../../css/displayDirectory.css";

// Hamburger Menu component
const HamburgerMenu = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMenuAction = (action) => {
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div className="hamburger-menu" ref={menuRef}>
      <button 
        className={`homeButton ${isOpen ? 'homeButton-selected' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu />
      </button>
      {isOpen && (
        <>
          {isMobile && <div className="menu-overlay" onClick={() => setIsOpen(false)} />}
          <div className="menu-dropdown">
            {actions.map((action, index) => (
              <React.Fragment key={action.id}>
                <button
                  className="menu-button"
                  onClick={() => handleMenuAction(action)}
                >
                  <action.icon />
                  <span>{action.label}</span>
                </button>
                {index < actions.length - 1 && <div className="menu-divider" />}
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function DisplayDirectory() {
  const {
    rootNodeId,
    childrenOfRootNode,
    displayNodeId,
    setPendingFileOperation,
    setReloadTrigger,
    resetToRoot,
    updatedFolderId,
    setUpdatedFolderId
  } = useContext(IndexContext);

  // Navigation state
  const [backHistory, setBackHistory] = useState([]);
  const [forwardHistory, setForwardHistory] = useState([]);
  const [currentDisplayNodes, setCurrentDisplayNodes] = useState(null);

  // Refs to avoid stale closures
  const currentDisplayNodesRef = useRef(null);
  const displayNodeIdRef = useRef(displayNodeId);
  const backHistoryRef = useRef(backHistory);
  const forwardHistoryRef = useRef(forwardHistory);

  const [selectState, setSelectState] = useState(false);

  // Sync refs with state
  useEffect(() => { currentDisplayNodesRef.current = currentDisplayNodes; }, [currentDisplayNodes]);
  useEffect(() => { displayNodeIdRef.current = displayNodeId; }, [displayNodeId]);
  useEffect(() => { backHistoryRef.current = backHistory; }, [backHistory]);
  useEffect(() => { forwardHistoryRef.current = forwardHistory; }, [forwardHistory]);

  // API: get children of node
  const getChildNodes = useCallback(async (idOfItemClicked) => {
    try {
      const response = await fetch('/databaseApi', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayNodeId: idOfItemClicked,
          requestType: 'get_child_nodes'
        })
      });
      return await response.json();
    } catch (err) {
      console.error(`error fetching child nodes: ${err}`);
      return [];
    }
  }, []);

  // Update display nodes for a given folder ID
  const updateDisplayNodes = useCallback(async (id) => {
    try {
      const response = await fetch('/databaseApi', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayNodeId: id,
          requestType: 'get_child_nodes'
        })
      });
      const body = await response.json();
      setCurrentDisplayNodes(body[0]?.children || []);
    } catch (err) {
      console.error(`error updating nodes for currentDisplayNodes ${err}`);
    }
  }, []);

  // Navigation buttons (back/forward)
  const handleNavClick = useCallback((direction) => {
    const currentNodes = currentDisplayNodesRef.current;
    const currentNodeId = currentNodes?.[0]?.parent_id;
    const prevNodeId = backHistoryRef.current[backHistoryRef.current.length - 1];
    const nextNodeId = forwardHistoryRef.current[0];

    if (direction === 'backward' && prevNodeId) {
      updateDisplayNodes(prevNodeId);
      setBackHistory(prev => prev.slice(0, -1));
      setForwardHistory(prev => [currentNodeId, ...prev]);
    }
    if (direction === 'forward' && nextNodeId) {
      updateDisplayNodes(nextNodeId);
      setForwardHistory(prev => prev.slice(1));
      setBackHistory(prev => [...prev, currentNodeId]);
    }
  }, [updateDisplayNodes]);

  // Folder click
  const handleFolderClick = useCallback((folderId) => {
    const currentNodes = currentDisplayNodesRef.current;
    const currentNodeId = currentNodes?.[0]?.parent_id;
    setForwardHistory([]);
    updateDisplayNodes(folderId);
    setBackHistory(prev => [...prev, currentNodeId]);
  }, [updateDisplayNodes]);

  // Sidebar state with responsive behavior
  const [showSideBar, setShowSideBar] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const lastX = useRef(0);

  // Responsive sidebar effect
  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 1024;
      if (isSmallScreen) {
        setShowSideBar(false);
      } else {
        setShowSideBar(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    lastX.current = e.clientX;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const difference = e.clientX - lastX.current;
      lastX.current = e.clientX;
      setDimensions(prev => ({
        ...prev,
        width: Math.min(Math.max(300, prev.width + difference), 1600)
      }));
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Icon vs list view
  const [isIcon, setIsIcon] = useState(true);

  // Upload card toggle
  const [displayUploadCard, setDisplayUploadCard] = useState(false);
  const handleUploadCardState = useCallback(() => {
    setDisplayUploadCard(prev => !prev);
  }, []);

  // Selection queue (shared for both delete and download)
  const [selectionQueue, setSelectionQueue] = useState([]);
  const handleSelectionQueue = useCallback((checkState, metadataObject) => {
    if (!checkState) {
      setSelectionQueue(prev => [...prev, metadataObject]);
    } else {
      setSelectionQueue(prev => prev.filter(el => el.id !== metadataObject.id));
    }
  }, []);

  // Legacy delete queue support (for backward compatibility)
  const [deleteQueue, setDeleteQueue] = useState([]);
  const handleDeleteQueue = useCallback((checkState, metadataObject) => {
    // Use the shared selection queue for consistency
    handleSelectionQueue(checkState, metadataObject);
    // Keep legacy deleteQueue in sync
    if (!checkState) {
      setDeleteQueue(prev => [...prev, metadataObject]);
    } else {
      setDeleteQueue(prev => prev.filter(el => el.id !== metadataObject.id));
    }
  }, [handleSelectionQueue]);

  // Single file download
  const downloadSingleFile = useCallback(async (fileId, fileName) => {
    try {
      console.log(`Starting download for file: ${fileName}`);
      const response = await fetch(`/download?type=single&id=${fileId}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Download failed:', errorData.error);
        alert(`Download failed: ${errorData.error}`);
        return;
      }

      // Create blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create temporary download link
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`File downloaded successfully: ${fileName}`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  }, []);

  // Bulk download (multiple files/folders)
  const downloadBulkFiles = useCallback(async (items) => {
    try {
      console.log(`Starting bulk download for ${items.length} items`);
      const response = await fetch('/download?type=bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Bulk download failed:', errorData.error);
        alert(`Download failed: ${errorData.error}`);
        return;
      }

      // Create blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `download-${timestamp}.zip`;

      // Create temporary download link
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`Bulk download completed: ${filename}`);
    } catch (error) {
      console.error('Bulk download error:', error);
      alert('Download failed. Please try again.');
    }
  }, []);

  const handleDownloadButton = useCallback(async () => {
    if (selectState && selectionQueue.length > 0) {
      try {
        console.log(`Starting download for ${selectionQueue.length} items`);

        if (selectionQueue.length === 1) {
          const item = selectionQueue[0];
          console.log('Downloading single file:', item.id, item.name);

          const response = await fetch(`/download?type=single&id=${item.id}`);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Download failed:', response.status, errorText);
            alert(`Download failed: ${errorText}`);
            return;
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = item.name || `file-${item.id}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          console.log(`Successfully downloaded: ${item.name}`);

        } else {
          // Multiple files - bulk download
          const items = selectionQueue.map(item => ({ id: item.id }));
          console.log('Downloading multiple files:', items);

          const response = await fetch('/download?type=bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Bulk download failed:', response.status, errorText);
            alert(`Download failed: ${errorText}`);
            return;
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `download-${Date.now()}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          console.log(`Successfully downloaded ${items.length} items as zip`);
        }

        // Clear selection after successful download
        setSelectionQueue([]);
        setDeleteQueue([]);
        setSelectState(false);

      } catch (error) {
        console.error('Download failed with error:', error);
        alert(`Download failed: ${error.message}`);
      }
    } else if (selectState && selectionQueue.length === 0) {
      alert('Please select files to download');
    } else {
      // Auto-enable select mode if not already active
      setSelectState(true);
      alert('Select mode enabled. Please choose files to download.');
    }
  }, [selectState, selectionQueue, setSelectionQueue, setDeleteQueue, setSelectState]);

  const handleDeleteButton = useCallback(async () => {
    if (selectState && selectionQueue.length > 0) {
      const currentDisplayNodeId = displayNodeIdRef.current;
      try {
        const response = await fetch('fileDelete', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deleteQueue: selectionQueue,
            displayNodeId: currentDisplayNodeId
          })
        });
        if (response.ok) {
          console.log("Files successfully deleted");
        } else {
          console.warn(`Failed to delete files with status: ${response.status}`);
        }

        // Clear selection after delete
        setSelectionQueue([]);
        setDeleteQueue([]);
        setSelectState(false);
        setPendingFileOperation(true);
        updateDisplayNodes(currentDisplayNodeId);
      } catch (error) {
        console.error(`Error deleting files: ${error}`);
      }
    } else if (selectState && selectionQueue.length === 0) {
      alert('Please select files or folders to delete.');
    } else {
      // Auto-enable select mode if not already active
      setSelectState(true);
      alert('Select mode enabled. Please choose files or folders to delete.');
    }
  }, [selectState, selectionQueue, setPendingFileOperation, updateDisplayNodes]);

  // Clear selections when select mode is disabled
  useEffect(() => {
    if (!selectState) {
      setSelectionQueue([]);
      setDeleteQueue([]);
    }
  }, [selectState]);

  // Initial & reload effect
  useEffect(() => {
    const nodeIdToUpdate = displayNodeId || rootNodeId;
    if (nodeIdToUpdate) {
      updateDisplayNodes(nodeIdToUpdate);
    }
    setPendingFileOperation(false);
  }, [displayNodeId, rootNodeId, updateDisplayNodes, setPendingFileOperation]);

  // Add a separate useEffect to handle folder updates
  useEffect(() => {
    if (updatedFolderId && (displayNodeId === updatedFolderId || (updatedFolderId === rootNodeId && displayNodeId === rootNodeId))) {
      updateDisplayNodes(updatedFolderId);
      // Reset after handling
      setTimeout(() => setUpdatedFolderId(null), 50);
    }
  }, [updatedFolderId, displayNodeId, rootNodeId, updateDisplayNodes, setUpdatedFolderId]);

  // Context props
  const folderTreeComponentProps = {
    childrenOfRootNode,
    getChildNodes,
    handleFolderClick
  };

  const displayDirectoryContextProps = {
    updateDisplayNodes,
    currentDisplayNodes,
    setCurrentDisplayNodes,
    isIcon,
    handleFolderClick,
    handleDeleteQueue,
    handleSelectionQueue,
    selectionQueue, 
    downloadSingleFile,
    downloadBulkFiles, 
    getChildNodes,
    handleUploadCardState,
    selectState
  };

  // Buttons for initial state
  const initialNavButtons = [
    {
      id: 'home',
      icon: Home,
      className: 'homeButton pointer',
      onClick: () => {
        resetToRoot();
        setForwardHistory([]);
        setBackHistory([]);
        setSelectionQueue([]);
        setDeleteQueue([]);
        setSelectState(false);
      }
    },
    {
      id: 'backward',
      icon: ChevronLeft,
      className: 'homeButton circle',
      onClick: () => handleNavClick("backward")
    },
    {
      id: 'forward',
      icon: ChevronRight,
      className: 'homeButton circle',
      onClick: () => handleNavClick("forward")
    },
  ];

  // Buttons for select state
  const selectStateButtons = [
    {
      id: 'delete',
      icon: Trash,
      className: `homeButton${selectState && selectionQueue.length > 0 ? ' homeButton-active' : ''}`,
      onClick: handleDeleteButton
    },
  ];

  // Buttons for hamburger menu
  const hamburgerActions = [
    {
      id: 'download',
      icon: Download,
      label: 'Download',
      onClick: handleDownloadButton
    },
    {
      id: 'upload',
      icon: Upload,
      label: 'Upload',
      onClick: handleUploadCardState
    },
    {
      id: 'view-toggle',
      icon: isIcon ? Grid : List,
      label: 'View',
      onClick: () => setIsIcon(prev => !prev)
    },
    {
      id: 'sidebar-toggle',
      icon: Sidebar,
      label: 'Toggle Sidebar',
      onClick: () => setShowSideBar(prev => !prev)
    }
  ];

  const handleDots = Array.from({ length: 3 }, (_, i) => ({ id: `dot-${i}` }));
  const renderButton = (btn) => {
    const Icon = btn.icon;
    return (
      <button key={btn.id} className={btn.className} onClick={btn.onClick}>
        <Icon />
      </button>
    );
  };


  return (
    <>
      {displayUploadCard && (
        <DisplayDirectoryContext.Provider value={displayDirectoryContextProps}>
          <UploadCard />
        </DisplayDirectoryContext.Provider>
      )}
      <div className="navWrapper prevent-select">
        <div className="nav-buttons-left">
          {initialNavButtons.map(renderButton)}
        </div>
        <div className="nav-buttons-right">
          {/* Render the Select button directly */}
          <button
            key="select"
            className={selectState ? 'homeButton homeButton-selected' : 'homeButton'}
            onClick={() => setSelectState(!selectState)}
          >
            <MousePointerClick />
          </button>
          {/* Conditionally render the Delete button when selectState is active and items are selected */}
          {selectState && selectionQueue.length > 0 && (
            <button
              key="delete"
              className="homeButton"
              onClick={handleDeleteButton}
            >
              <Trash />
            </button>
          )}
          {/* Render the Hamburger Menu */}
          <HamburgerMenu actions={hamburgerActions} />
        </div>
      </div>
      <div className="mainWindowWrapper prevent-select">
        {showSideBar && (
          <div
            onMouseDown={handleMouseDown}
            style={{ width: `${dimensions.width}px` }}
            className="dirTreeSideBar"
          >
            <div className="sideItemWrapper">
              <FolderTree {...folderTreeComponentProps} />
            </div>
            <div className="handle">
              <div className="handle-gui">
                {handleDots.map(dot => (
                  <div key={dot.id} className="dot"></div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className={isIcon ? "gridIconDisplayWrapper" : "listIconDisplayWrapper"}>
          <DisplayDirectoryContext.Provider value={displayDirectoryContextProps}>
            <HandleDisplayIcons />
          </DisplayDirectoryContext.Provider>
        </div>
      </div>
    </>
  );
}