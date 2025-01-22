import Folder from "../DisplayDirectory/Folder/folder";
import File from "../DisplayDirectory/File/file";

export default function HandleDisplayIcons({ 
  childrenOfCurrentNode,
  isIcon,
  handleFolderClick,
  handleIdArrState
}) {

  if (!childrenOfCurrentNode) {
    return <h1>Loading...</h1>;
  }

  return childrenOfCurrentNode.map(child => {
    const isFolder = child.metadata?.is_folder === true;
    
    return isFolder ? (
      <Folder 
        key={child.metadata.id}
        name={child.metadata.name}
        id={child.metadata.id}
        isIcon={isIcon}
        handleFolderClick={handleFolderClick}
        handleIdArrState={handleIdArrState}
      />
    ) : (
      <File 
        key={child.metadata.id}
        id={child.metadata.id}
        name={child.metadata.name}
        isIcon={isIcon}
        handleIdArrState={handleIdArrState}
      />
    );
  })
}