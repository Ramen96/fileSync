import { 
  FolderPlus,
  FilePlus,
  XCircle
 } from "lucide-react";

import "./uploadcard.css";

export default function UploadCard({
  handleUploadCardState
}) {
  return(
    <div className="blur-background">
      <div className="upload-card-wrapper">
        <div className="title-wrapper">
          <div className="h1-wrapper">
            <h1 className="h1">New Upload</h1>
          </div>
          <XCircle 
            onClick={() => {
              handleUploadCardState();
            }}
            className="x-circle" />
        </div>
        <div className="btn-wrapper">
          <button className="btn">
            <FolderPlus /> 
          </button>
          <button className="btn">
            <FilePlus /> 
          </button>
        </div>
        <div className="drag-n-drop">
        </div>
      </div>
    </div>
  )
}