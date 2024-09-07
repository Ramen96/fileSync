import "../css/index.css";
import SideBar from "../components/SideBar/sidebar";
const searchIcon  = "../assets/search.svg"

export default function Index() {
  return (
    <>
    <SideBar />
    <div className="main">
      <div className="searchbarwrapper flex-jc-ai w100">
        <img className="searchIcon" src={searchIcon} alt="search icon" />
        <input className="searchBar" id="searchbar" type="text" placeholder="Search drive" />
      </div>
      <div className="mainWindow"></div>
    </div>
    </>
  );
}
