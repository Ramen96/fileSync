import { 
  FileCheck, 
  FolderCheck,
  Trash2
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import "./uploadItem.css";

export default function UploadItem({
  fileArr
}) {

  return fileArr.slice().reverse().map((children) => 
    <div key={uuidv4()} className="metadata-item-container">
      <div className="upload-item-wrapper">
        <div className="upload-item">
          <div className="file-item-wrapper">
            <FileCheck className="file-check-icon" />
            <h1 className="file-name">{children.name}</h1>
          </div>
          <div className="trash-icon-container" >
            <div 
              role="button"
              className="trash-icon-wrapper"
              onClick={() => {
                setUploadMetaData(
                  uploadMetaData.filter(item => item.id !== children.id)
                )
              }}>
              <Trash2 className="trash-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}