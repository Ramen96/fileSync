import { data } from "react-router";
import { useLoaderData } from "react-router";
import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { IndexContext, wsContext } from "../utils/context.js";
import { prisma } from "../utils/prisma.server.js";
import SideBar from "../components/SideBar/sidebar.jsx";
import DisplayDirectory from "../components/DisplayDirectory/displayDirectory.jsx";
import SearchBar from "../components/SearchBar/searchBar.jsx";
import "../css/index.css";

export async function loader() {
  try {
    const initRoot = await prisma.hierarchy.findFirst({
      where: {
        parent_id: null,
      },
      include: {
        metadata: true,
        children: {
          include: {
            metadata: true,
          }
        }
      }
    });

    return data(initRoot);
  } catch (error) {
    console.error("Error fetching data:", error);
    return data({}, { status: 500 });
  }
}

export default function Index() {
  const [displayNodeId, setDisplayNodeId] = useState(null);
  const [childrenOfRootNode, setChildrenOfRootNode] = useState(null);
  const [pendingFileOperation, setPendingFileOperation] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [backHistory, setBackHistory] = useState([]);
  const [forwardHistory, setForwardHistory] = useState([]);
  const [currentDisplayNodes, setCurrentDisplayNodes] = useState(null);
  const [updatedFolderId, setUpdatedFolderId] = useState(null);

  const getChildNodes = useCallback(async (id) => {
  try {
    const res = await fetch('/databaseApi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayNodeId: id, requestType: 'get_child_nodes' })
    });
    const body = await res.json();
    return body;
  } catch (err) {
    console.error(err);
    return [];
  }
}, []);

const updateDisplayNodes = useCallback(async (id) => {
  const body = await getChildNodes(id);
  setCurrentDisplayNodes(body[0]?.children || []);
  setDisplayNodeId(id);
}, [getChildNodes]);

const handleNavClick = useCallback((direction) => {
  const currentNodeId = currentDisplayNodes?.[0]?.parent_id;
  const prevNodeId = backHistory[backHistory.length - 1];
  const nextNodeId = forwardHistory[0];

  if (direction === 'backward' && prevNodeId) {
    updateDisplayNodes(prevNodeId);
    setBackHistory(b => b.slice(0, -1));
    setForwardHistory(f => [currentNodeId, ...f]);
  }

  if (direction === 'forward' && nextNodeId) {
    updateDisplayNodes(nextNodeId);
    setForwardHistory(f => f.slice(1));
    setBackHistory(b => [...b, currentNodeId]);
  }
}, [backHistory, forwardHistory, currentDisplayNodes, updateDisplayNodes]);

const handleFolderClick = useCallback((folderId) => {
  const currentNodeId = currentDisplayNodes?.[0]?.parent_id;
  setForwardHistory([]);
  updateDisplayNodes(folderId);
  setBackHistory(b => [...b, currentNodeId]);
}, [currentDisplayNodes, updateDisplayNodes]);



  const db = useLoaderData();
  const childrenOfRoot = db.children;
  const rootNodeId = db.id;

  const socket = useContext(wsContext);

  const displayNodeIdRef = useRef(displayNodeId);
  const pendingFileOperationRef = useRef(pendingFileOperation);
  const reloadTriggerRef = useRef(reloadTrigger);

  useEffect(() => {
    displayNodeIdRef.current = displayNodeId;
  }, [displayNodeId]);

  useEffect(() => {
    pendingFileOperationRef.current = pendingFileOperation;
  }, [pendingFileOperation]);

  useEffect(() => {
    reloadTriggerRef.current = reloadTrigger;
  }, [reloadTrigger]);

  useEffect(() => {
    setChildrenOfRootNode(childrenOfRoot);
    setDisplayNodeId(rootNodeId);
  }, [childrenOfRoot, rootNodeId]);

  useEffect(() => {
    const refreshRootChildren = async () => {
      if (reloadTrigger > 0) {
        try {
          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              displayNodeId: rootNodeId,
              requestType: 'get_child_nodes'
            })
          };
          
          const response = await fetch('/databaseApi', options);
          const body = await response.json();
          
          if (body[0]?.children) {
            setChildrenOfRootNode(body[0].children);
          }
        } catch (error) {
          console.error("Error refreshing root children:", error);
        }
      }
    };

    refreshRootChildren();
  }, [reloadTrigger, rootNodeId]);

  const handleWebSocketMessage = useCallback((event) => {
    try {
      const msgObject = JSON.parse(event.data);
      if (msgObject?.message === 'reload') {
        setPendingFileOperation(true);
        // setDisplayNodeId(msgObject.id);
        // setReloadTrigger(prev => prev + 1);
        setUpdatedFolderId(msgObject.id);
        setTimeout(() => {
          setPendingFileOperation(false);
        }, 500);
      } else if (msgObject.message === false) {
        console.log('message: ', msgObject.message);
        setPendingFileOperation(false);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      setPendingFileOperation(false);
    }
  }, []);

  const handleWebSocketOpen = useCallback((event) => {
    if (socket) {
      socket.send(JSON.stringify({ action: 'connection', message: 'Hello Server!' }));
    }
  }, [socket]);

  const handleWebSocketClose = useCallback((event) => {
    console.log('WebSocket connection closed:', event.code, event.reason);
  }, []);

  const handleWebSocketError = useCallback((error) => {
    console.error('WebSocket error:', error);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.addEventListener('open', handleWebSocketOpen);
    socket.addEventListener('message', handleWebSocketMessage);
    socket.addEventListener('close', handleWebSocketClose);
    socket.addEventListener('error', handleWebSocketError);

    return () => {
      socket.removeEventListener('open', handleWebSocketOpen);
      socket.removeEventListener('message', handleWebSocketMessage);
      socket.removeEventListener('close', handleWebSocketClose);
      socket.removeEventListener('error', handleWebSocketError);
    };
  }, [socket, handleWebSocketOpen, handleWebSocketMessage, handleWebSocketClose, handleWebSocketError]);

  const resetToRoot = useCallback(() => {
    setDisplayNodeId(rootNodeId);
    setIsSearchMode(false);
    setSearchResults(null);
  }, [rootNodeId]);

  const fileUpload = useCallback((event) => {
    const currentDisplayNodeId = displayNodeIdRef.current;
    if (!currentDisplayNodeId) {
      console.error('No display node ID available for upload');
      return;
    }

    setPendingFileOperation(true);

    const files = event.target.files;
    if (!files || files.length === 0) {
      setPendingFileOperation(false);
      return;
    }

    const fileList = new FormData();

    for (let i = 0; i < files.length; i++) {
      fileList.append(files[i].name, files[i]);
    }

    const metadata = () => {
      const dataArr = [];
      for (let i = 0; i < files.length; i++) {
        const fileObject = files[i];
        console.log('item in fileObject', fileObject);

        const fileInfo = {
          parent_id: currentDisplayNodeId,
        };

        if (fileObject.webkitRelativePath.length === 0) {
          fileInfo.is_folder = false;
        } else if (fileObject.webkitRelativePath.length > 0) {
          fileInfo.is_folder = true;
        }

        fileInfo.name = fileObject.name;
        fileInfo.webkitRelativePath = fileObject.webkitRelativePath;
        fileInfo.type = fileObject.type;
        dataArr.push(fileInfo);
      }
      return dataArr;
    };

    fileList.append('metadata', JSON.stringify(metadata()));

    fetch("uploadAPI", {
      method: "POST",
      body: fileList
    })
      .then((res) => {
        if (res.ok) {
          console.log("Upload successful");
        } else {
          console.log(`Upload failed with status: ${res.status}`);
        }
        setPendingFileOperation(false);
        // setReloadTrigger(prev => prev + 1);
        setUpdatedFolderId(currentDisplayNodeId);
      })
      .catch((err) => {
        console.error(err);
        setPendingFileOperation(false);
      });
  }, []);

  // New search functionality
  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      setSearchResults(null);
      return;
    }

    try {
      setPendingFileOperation(true);
      
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          searchQuery: searchQuery,
          requestType: 'search_files'
        })
      };
      
      const response = await fetch('/databaseApi', options);
      const searchData = await response.json();
      
      setSearchResults(searchData);
      setIsSearchMode(true);
      
    } catch (error) {
      console.error("Error searching files:", error);
      setSearchResults([]);
      setIsSearchMode(true);
    } finally {
      setPendingFileOperation(false);
    }
  }, []);

  const handleSearchNavigation = useCallback((parentId) => {
    setDisplayNodeId(parentId);
    setIsSearchMode(false); 
    setSearchResults(null); 
  }, []);

  const indexContextProps = {
    childrenOfRootNode: isSearchMode ? searchResults : childrenOfRootNode,
    currentDisplayNodes,
    setCurrentDisplayNodes,
    updateDisplayNodes,
    getChildNodes,
    handleFolderClick,
    handleNavClick,
    backHistory,
    forwardHistory,
    setBackHistory,
    setForwardHistory,
    setChildrenOfRootNode,
    fileUpload,
    displayNodeId,
    setDisplayNodeId,
    rootNodeId,
    pendingFileOperation,
    setPendingFileOperation,
    reloadTrigger,
    setReloadTrigger,
    isSearchMode,
    setIsSearchMode,
    searchResults,
    setSearchResults,
    resetToRoot,
    updatedFolderId,
    setUpdatedFolderId
  };

  return (
    <>
    <IndexContext.Provider value={indexContextProps}>
      <SideBar />
    </IndexContext.Provider>
      <div className="main">
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search drive" 
          onNavigate={handleSearchNavigation}
        />
        <div className="mainWindow main-bg">
          <IndexContext.Provider value={indexContextProps}>
            <DisplayDirectory />
          </IndexContext.Provider>
        </div>
      </div>
    </>
  );
}