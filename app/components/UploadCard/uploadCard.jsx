import { useEffect } from "react";
import {  FolderPlus, FilePlus, XCircle, UploadCloudIcon } from "lucide-react";
import { useRef, useContext, useState } from "react";
import { DisplayDirectoryContext, IndexContext, wsContext } from "../../utils/context";
import UploadItem from "../uploadItem/uploadItem";
import "../../css/uploadCard.css";

export default function UploadCard() {
  const {
    handleUploadCardState,
  } = useContext(DisplayDirectoryContext);

  const {
    fileUpload,
    displayNodeId,
  } =  useContext(IndexContext)

  const socket = useContext(wsContext);
   const wsTriggerReload = (id) => {
    socket.send(
      JSON.stringify({
        action: "reload",
        id: id
      })
    );
  }

  const inputRef = useRef(null);
  const folderInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [multiUpload, setMultiUpload] = useState(false);
  const [fileArr, setFileArr] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

   const [isMobile, setIsMobile] = useState(false);

  const handleMultiUploadState = () => {
    multiUpload ? setMultiUpload(false) : setMultiUpload(true);
  };

  const createFileDataObject = (event) => {
    const file = event.target.files;
    const fileDataArr = [];
    for (let i = 0; i < file.length; i++) {
      fileDataArr.push(file[i]);
    }
    setFileArr([...fileArr, ...fileDataArr]);
    if (folderInputRef.current.value !== "") {
      folderInputRef.current.value = "";
    }
    if (fileInputRef.current.value !== "") {
      fileInputRef.current.value = "";
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFileArr([...fileArr, ...droppedFiles]);
    }
  };

  const uploadItemProps = {
    fileArr: fileArr,
    setFileArr: setFileArr,
  };


    useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


    return (
    <div className="blur-background">
      <div 
        className={`upload-card-wrapper ${isDragOver ? 'drag-over' : ''} ${isMobile ? 'mobile' : ''}`}
        onDragEnter={!isMobile ? handleDragEnter : undefined}
        onDragLeave={!isMobile ? handleDragLeave : undefined}
        onDragOver={!isMobile ? handleDragOver : undefined}
        onDrop={!isMobile ? handleDrop : undefined}
      >
        <div className="title-wrapper">
          <div className="h1-wrapper">
            <h1 className="h1">Upload Files</h1>
            <XCircle
              onClick={handleUploadCardState}
              className="x-circle"
            />
          </div>
        </div>

        <div className="btn-wrapper">
          <div className="btn" role="button">
            <label className="btn-label" htmlFor="new-folder">
              <FolderPlus className="margin-r-1" />
              <span>Folder Upload</span>
            </label>
            <input
              ref={folderInputRef}
              style={{ display: "none" }}
              id="new-folder"
              type="file"
              webkitdirectory=""
              multiple={multiUpload}
              onChange={createFileDataObject}
            />
          </div>
          <div className="btn" role="button">
            <label className="btn-label" htmlFor="new-file">
              <FilePlus className="margin-r-1" />
              <span>File Upload</span>
            </label>
            <input
              ref={fileInputRef}
              id="new-file"
              style={{ display: "none" }}
              type="file"
              multiple={multiUpload}
              onChange={createFileDataObject}
            />
          </div>
        </div>

        {!isMobile && (
          <div className="upload-multiple">
            <span>Upload Multiple</span>
            <label className="cb-con">
              <input
                checked={multiUpload}
                onChange={() => handleMultiUploadState()}
                className="checkbox"
                type="checkbox"
              />
              <span className="checkmark"></span>
            </label>
          </div>
        )}

        <div className={`drag-n-drop ${isDragOver ? 'drag-active' : ''}`}>
          <UploadItem {...uploadItemProps} />
          {isDragOver && !isMobile && (
            <div className="drag-overlay">
              <p>Drop files here to upload</p>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (fileArr.length === 0) return;
            const event = { target: { files: fileArr } };
            fileUpload(event);
            setFileArr([]);
            handleUploadCardState();
            wsTriggerReload(displayNodeId);
          }}
          className="upload-btn"
          disabled={fileArr.length === 0}
        >
          {fileArr.length > 0 ? 'Upload Files' : 'Select Files to Upload'}
        </button>
      </div>
    </div>
  );

  // return (
  //   <div className="blur-background">
  //     <div 
  //       className={`upload-card-wrapper ${isDragOver ? 'drag-over' : ''}`}
  //       onDragEnter={handleDragEnter}
  //       onDragLeave={handleDragLeave}
  //       onDragOver={handleDragOver}
  //       onDrop={handleDrop}
  //     >
  //       <div className="title-wrapper">
  //         <div className="h1-wrapper">
  //           <h1 className="h1">New Upload</h1>
  //           <XCircle
  //             onClick={() => {
  //               handleUploadCardState();
  //             }}
  //             className="x-circle"
  //           />
  //         </div>
  //       </div>
  //       <div className="btn-wrapper">
  //         <div className="btn" role="button">
  //           <label className="btn-label" htmlFor="new-folder">
  //             <FolderPlus className="margin-r-1" /> New Folder
  //           </label>
  //           {multiUpload ? (
  //             <input
  //               ref={inputRef}
  //               style={{ display: "none" }}
  //               id="new-folder"
  //               type="file"
  //               webkitdirectory=""
  //               multiple
  //               onChange={(e) => {
  //                 createFileDataObject(e);
  //               }}
  //             />
  //           ) : (
  //             <input
  //               ref={inputRef}
  //               style={{ display: "none" }}
  //               id="new-folder"
  //               type="file"
  //               webkitdirectory=""
  //               onChange={(e) => {
  //                 createFileDataObject(e);
  //               }}
  //             />
  //           )}
  //         </div>
  //         <div className="btn" role="button">
  //           <label className="btn-label" htmlFor="new-file">
  //             <FilePlus className="margin-r-1" /> New File
  //           </label>
  //           {multiUpload ? (
  //             <input
  //               ref={inputRef}
  //               id="new-file"
  //               style={{ display: "none" }}
  //               type="file"
  //               multiple
  //               onChange={(e) => {
  //                 createFileDataObject(e);
  //               }}
  //             />
  //           ) : (
  //             <input
  //               ref={inputRef}
  //               id="new-file"
  //               style={{ display: "none" }}
  //               type="file"
  //               onChange={(e) => {
  //                 createFileDataObject(e);
  //               }}
  //             />
  //           )}
  //         </div>
  //       </div>
  //       <div className="upload-multiple">
  //         Upload Multiple?
  //         <label className="cb-con test">
  //           <input
  //             checked={multiUpload}
  //             onChange={(e) => console.log(e.target.value)}
  //             className="checkbox"
  //             type="checkbox"
  //           />
  //           <span
  //             className="checkmark"
  //             onClick={(e) => {
  //               e.stopPropagation();
  //               handleMultiUploadState();
  //             }}
  //           ></span>
  //         </label>
  //       </div>
  //       <div className={`drag-n-drop ${isDragOver ? 'drag-active' : ''}`}>
  //         <UploadItem {...uploadItemProps} />
  //         {isDragOver && (
  //           <div className="drag-overlay">
  //             <p>Drop files here to upload</p>
  //           </div>
  //         )}
  //       </div>
  //       <div className="cloud-wrapper">
  //         <UploadCloudIcon className="uploadCloudIcon" />
  //       </div>
  //       <button
  //         onClick={() => {
  //           if (fileArr.length === 0) return;

  //           const event = {
  //             target: {
  //               files: fileArr
  //             }
  //           }

  //           fileUpload(event);
  //           setFileArr([]);
  //           handleUploadCardState();
  //           wsTriggerReload(displayNodeId);
  //         }}
  //         className="upload-btn"
  //       >
  //         Upload
  //       </button>
  //     </div>
  //   </div>
  // );
}