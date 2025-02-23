import { 
  FolderPlus,
  FilePlus,
  XCircle,
  UploadCloudIcon,
  FolderMinus
 } from "lucide-react";
import { useRef } from "react";
import UploadItem from "../uploadItem/uploadItem";
import "../../../css/uploadCard.css";
import { useState } from "react";
export default function UploadCard({
  handleUploadCardState,
  displayNodeId
}) {

  const inputRef = useRef(null);

  const [multiUpload, setMultiUpload] = useState(false);
  const [fileArr, setFileArr] = useState([]);

  const handleMultiUploadState = () => {
    multiUpload ? setMultiUpload(false) : setMultiUpload(true);
  }

  const createFileDataObject = (event) => {
    const file = event.target.files;
    const fileDataArr = [];
    for (let i = 0; i < file.length; i++) {
      fileDataArr.push(file[i]);
    }
    setFileArr([...fileArr, ...fileDataArr]);
    if (inputRef.current.value !== '') {
      inputRef.current.value = '';
    }
  }

  const handleSubmit = () => {
    const fileList = new FormData();
    const dataArr = [];

    fileArr.forEach(item => {
      if (item instanceof File) {
        const fileObject = item;
        const fileInfo = {
          parent_id: displayNodeId
        }
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
    });

    dataArr.forEach(item => {
      fileList.append(item.name, item);
    });

    fetch("fileStorage", {
      method: "POST",
      body : fileList
    })
    .then(res => {
      if (res.status !== 200) console.log(`Response: ${res.status}`)
    })
    .catch(err => console.error(err));
    setFileArr([]);
  }

  const uploadItemProps = {
    fileArr: fileArr,
    setFileArr: setFileArr
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
          <div className="btn" role="button">
            <label className="btn-label" htmlFor="new-folder">
              <FolderPlus className="margin-r-1" /> New Folder
            </label>
            {multiUpload
              ? <input 
                  ref={inputRef}
                  style={{"display":"none"}} 
                  id="new-folder" 
                  type="file" 
                  webkitdirectory="" 
                  multiple 
                  onChange={(e) => {
                    createFileDataObject(e);
                  }}
                />
              : <input 
                  ref={inputRef}
                  style={{"display":"none"}} 
                  id="new-folder" 
                  type="file" 
                  webkitdirectory="" 
                  onChange={(e) => {
                    createFileDataObject(e);
                  }}
                />
            }
          </div>
          <div className="btn" role="button">
            <label className="btn-label" htmlFor="new-file">
              <FilePlus className="margin-r-1" /> New File
            </label>
            {multiUpload
              ? <input 
                  ref={inputRef}
                  id="new-file" 
                  style={{"display":"none"}} 
                  type="file" 
                  multiple 
                  onChange={(e) => {
                    createFileDataObject(e);
                  }}
                />
              : <input 
                  ref={inputRef}
                  id="new-file" 
                  style={{"display":"none"}} 
                  type="file" 
                  onChange={(e) => {
                    createFileDataObject(e);
                  }}
                />
            }
          </div>
        </div>
        <div className="upload-multiple">
          Upload Multiple? 
          <label className="cb-con test" >
            <input checked={multiUpload} onChange={e => console.log(e.target.value)} className="checkbox" type="checkbox" />
            <span className="checkmark" onClick={(e) => {
                e.stopPropagation();
                handleMultiUploadState();
              }}></span>
          </label>
        </div>
        <div className="drag-n-drop">
          <UploadItem {...uploadItemProps}/>
          <div className="cloud-wrapper">
            <UploadCloudIcon className="uploadCloudIcon" />
          </div>
        </div>
        <button 
          onClick={() => {
            handleSubmit();
          }}
          className="upload-btn">
          Upload
        </button>
      </div>
    </div>
  )
}