import { 
  FolderPlus,
  FilePlus
 } from "lucide-react";

import "./uploadcard.css";

export default function UploadCard() {
  return(
    <div className="blur-background">
      <div className="upload-card-wrapper">
        <h1 className="h1">New Upload</h1>
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