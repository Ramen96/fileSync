import "../displayDirectory.css"

export default function SideFolder({
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