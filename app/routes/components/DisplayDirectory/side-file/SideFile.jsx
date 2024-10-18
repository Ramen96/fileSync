export default function SideFile({
  name,
  id, 
  handleSideFolderClick
}) {
  return (
    <div className="sideItem">
      <h3 className="sideItemName">{name}</h3>
    </div> 
  )
}