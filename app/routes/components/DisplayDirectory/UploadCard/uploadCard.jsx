import { 
  FolderPlus,
  FilePlus,
  XCircle,
  UploadCloudIcon
 } from "lucide-react";
import { useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import UploadItem from "./uploadItem/uploadItem";
import { fileUpload } from "../../SideBar/sidebar";
import "./uploadcard.css";
import { useState } from "react";
import { useEffect } from "react";
export default function UploadCard({
  handleUploadCardState
}) {

  const inputRef = useRef(null);

  const [multiUpload, setMultiUpload] = useState(false);
  const [formDataFileList, setFormDataFileList] = useState([]);
  const [uploadMetaData, setUploadMetaData] = useState([]);

  const handleMulitUploadState = () => {
    multiUpload ? setMultiUpload(false) : setMultiUpload(true);
  }

  const createFileDataObject = (event) => {
    const file = event.target.files;
    for (let i = 0; i < file.length; i++) {
      file[i].id = uuidv4();
      setFormDataFileList([...formDataFileList, file[0]])
      setUploadMetaData([...uploadMetaData, file[i]]);
    }

    if (inputRef.current.value !== '') {
      inputRef.current.value = '';
    }
  }

  const handleSubmit = () => {
    const formDataObject = new FormData();

    for (let i = 0; i < formDataFileList.length; i++) {
      formDataObject.append(formDataFileList[i].name, formDataFileList[i]);
    }

    fetch("fileStorage", {
      method: "POST",
      body : formDataObject
    })

    setFormDataFileList([]);
  }

  const uploadItemProps = {
    uploadMetaData: uploadMetaData,
    setUploadMetaData: setUploadMetaData
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
            <label className="btn-lable" htmlFor="new-folder">
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
            <label className="btn-lable" htmlFor="new-file">
              <FilePlus className="margin-r-1" /> New File
            </label>
            {multiUpload
              ? <input 
                  ref={inputRef}
                  id="new-file" 
                  style={{"display":"none"}} 
                  type="file" multiple 
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
                handleMulitUploadState();
              }}></span>
          </label>
        </div>
        <div className="drag-n-drop">
          <UploadItem {...uploadItemProps}/>
          <UploadCloudIcon className="uploadCloudIcon" />
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