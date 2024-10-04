export default function DisplayDirectory({ files }) {
  // console.log("DisplayDirectory component files:", files[0]);
  const fileData = files;
  for ( let key in fileData) {
    console.log(fileData[key]);
  }

  if (!files || files.length === 0) {
    return <h1 style={{"color": "white"}}>No Files (files is {JSON.stringify(files)})</h1>;
  } else {
    return (
      <div>
        <h1 style={{"color": "red"}}>Files here</h1>
        <ul>
          {files.map(file => (
            <li style={{"color": "white", "margin": "1rem"}} key={file.id}> File Path: {file.relitive_path}, File Type: {file.file_type}</li>
          ))}
        </ul>
      </div>
    );
  }
}