import { 
  FileCheck, 
  FolderCheck,
  Trash2
} from "lucide-react";
import "./uploadItem.css";

export default function UploadItem({
  uploadMetaData
}) {

  return uploadMetaData.map((children) => 
    <div key={Math.random()} className="metadata-item-container">
      <div className="upload-item-wrapper">
        <div className="upload-item">
          <div className="file-item-wrapper">
            <FileCheck className="file-check-icon" />
            <h1 className="file-name">{children.name}</h1>
          </div>
          <div className="trash-icon-container" >
            <div className="trash-icon-wrapper">
              <Trash2 className="trash-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}