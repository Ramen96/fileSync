import { 
  FolderPlus,
  FilePlus,
  XCircle,
  UploadCloudIcon
 } from "lucide-react";

import "./uploadcard.css";
import { useState } from "react";

export default function UploadCard({
  handleUploadCardState
}) {

  const [multiUpload, setMultiUpload] = useState(false);

  const handleMulitUploadState = () => {
    multiUpload ? setMultiUpload(false) : setMultiUpload(true);
  }
  
  return(
    <div className="blur-background">
      <div className="upload-card-wrapper">
        <div className="title-wrapper">
          <div className="h1-wrapper">
            <h1 className="h1">New Upload</h1>
            <XCircle 
              onClick={() => {
                handleUploadCardState();
              }}
              className="x-circle" />
          </div>
        </div>
        <div className="btn-wrapper">
          <div role="button" className="btn">
            <FolderPlus className="margin-r-1" /> New Folder
          </div>
          <div role="button" className="btn">
            <FilePlus className="margin-r-1" /> New File
          </div>
        </div>
        <div className="upload-multiple">
          Upload Multiple? 
          <label className="cb-con test" >
            <input checked={multiUpload} onChange={e => console.log(e.target.value)} className="checkbox" type="checkbox" />
            <span className="checkmark" onClick={(e) => {
                e.stopPropagation();
                handleMulitUploadState();
              }}></span>
          </label>
        </div>
        <div className="drag-n-drop">
          <UploadCloudIcon className="uploadCloudIcon" />
        </div>
        <button className="upload-btn">
          Upload
        </button>
      </div>
    </div>
  )
}